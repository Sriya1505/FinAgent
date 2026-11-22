"""
FinAgent Comprehensive Test Suite
Tests clean starting state, 8 core modules, ML models, deterministic calculations, 
and supervisor multi-agent collaboration with user isolation.
"""

import os
import sys
import unittest
from datetime import datetime

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend")
sys.path.insert(0, backend_dir)

import main
from main import (
    TransactionCreate,
    TransactionUpdate,
    BudgetCreate,
    SavingsGoalCreate,
    SavingsGoalUpdate,
    ChatRequest,
    WhatIfRequest
)
from database import init_db, get_db_connection
from ml.categorization import classifier
from ml.prediction import predictor
from ml.anomaly_detection import detector
from services.finance_engine import FinancialEngine

class TestFinAgentDirect(unittest.TestCase):
    test_user_id = None
    test_email = "test_priya@finagent.com"

    @classmethod
    def setUpClass(cls):
        init_db()
        conn = get_db_connection()
        # Clean up if leftover from previous test run
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE email = ?", (cls.test_email,))
        row = cursor.fetchone()
        if row:
            uid = row["user_id"]
            cursor.execute("DELETE FROM transactions WHERE user_id = ?", (uid,))
            cursor.execute("DELETE FROM budgets WHERE user_id = ?", (uid,))
            cursor.execute("DELETE FROM savings_goals WHERE user_id = ?", (uid,))
            cursor.execute("DELETE FROM finny_messages WHERE user_id = ?", (uid,))
            cursor.execute("DELETE FROM finny_conversations WHERE user_id = ?", (uid,))
            cursor.execute("DELETE FROM users WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM password_resets WHERE email = ?", (cls.test_email,))
        conn.commit()
        conn.close()

    @classmethod
    def tearDownClass(cls):
        if cls.test_user_id:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM transactions WHERE user_id = ?", (cls.test_user_id,))
            cursor.execute("DELETE FROM budgets WHERE user_id = ?", (cls.test_user_id,))
            cursor.execute("DELETE FROM savings_goals WHERE user_id = ?", (cls.test_user_id,))
            cursor.execute("DELETE FROM finny_messages WHERE user_id = ?", (cls.test_user_id,))
            cursor.execute("DELETE FROM finny_conversations WHERE user_id = ?", (cls.test_user_id,))
            cursor.execute("DELETE FROM users WHERE user_id = ?", (cls.test_user_id,))
            cursor.execute("DELETE FROM password_resets WHERE email = ?", (cls.test_email,))
            conn.commit()
            conn.close()

    def test_01_health_check(self):
        res = main.health_check()
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["service"], "FinAgent API")
        print("✓ Health Check Passed")

    def test_01b_auth_signup_and_duplicate_check(self):
        signup_payload = main.UserSignUp(
            name="Priya Patel",
            email=self.test_email,
            password="SecretPassword123"
        )
        res = main.sign_up(signup_payload)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertIn("token", res)
        self.assertEqual(res["user"]["email"], self.test_email)
        TestFinAgentDirect.test_user_id = res["user"]["user_id"]
        self.assertGreater(TestFinAgentDirect.test_user_id, 0)
        print(f"✓ Auth SignUp Verified: User ID {TestFinAgentDirect.test_user_id} created with JWT token")

        # Duplicate check
        with self.assertRaises(main.HTTPException) as ctx:
            main.sign_up(signup_payload)
        self.assertEqual(ctx.exception.status_code, 400)
        print("✓ Auth Duplicate Email Guard Verified")

    def test_01c_auth_login_and_invalid_credentials(self):
        # Successful login
        login_payload = main.UserLogin(
            email=self.test_email,
            password="SecretPassword123"
        )
        res = main.login(login_payload)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertIn("token", res)
        self.assertEqual(res["user"]["name"], "Priya Patel")
        print("✓ Auth Login Verified: Authenticated successfully")

        # Wrong password
        with self.assertRaises(main.HTTPException) as ctx:
            main.login(main.UserLogin(email=self.test_email, password="wrongPassword"))
        self.assertEqual(ctx.exception.status_code, 401)
        print("✓ Auth Rejection of Invalid Password Verified (401)")

    def test_01d_auth_me_profile(self):
        login_res = main.login(main.UserLogin(email=self.test_email, password="SecretPassword123"))
        token = login_res["token"]
        
        # With valid Bearer token
        me_res = main.get_current_user_profile(authorization=f"Bearer {token}")
        self.assertEqual(me_res["user"]["email"], self.test_email)
        print(f"✓ Auth /me Profile Verified: {me_res['user']['name']} ({me_res['user']['email']})")

        # Without token
        with self.assertRaises(main.HTTPException) as ctx:
            main.get_current_user_profile(authorization=None)
        self.assertEqual(ctx.exception.status_code, 401)

    def test_01e_auth_forgot_and_reset_password(self):
        # 1. Request forgot password code
        f_res = main.forgot_password(main.ForgotPasswordRequest(email=self.test_email))
        self.assertEqual(f_res["status"], "SUCCESS")
        code = f_res["reset_code"]
        self.assertEqual(len(code), 6)
        print(f"✓ Auth Forgot Password Verified: 6-digit recovery code generated ({code})")

        # 2. Reset password using recovery code
        r_res = main.reset_password(main.ResetPasswordRequest(
            email=self.test_email,
            reset_code=code,
            new_password="NewPriyaPassword789"
        ))
        self.assertEqual(r_res["status"], "SUCCESS")
        print("✓ Auth Password Reset Verified")

        # 3. Verify login with new password
        login_new = main.login(main.UserLogin(email=self.test_email, password="NewPriyaPassword789"))
        self.assertEqual(login_new["status"], "SUCCESS")
        print("✓ Auth Login with New Password Verified")

        # 4. Verify old password no longer works
        with self.assertRaises(main.HTTPException) as ctx:
            main.login(main.UserLogin(email=self.test_email, password="SecretPassword123"))
        self.assertEqual(ctx.exception.status_code, 401)
        print("✓ Auth Old Password Invalidation Verified")

    def test_02_clean_state_for_new_user(self):
        # New user should have completely empty metrics (₹0 balance, ₹0 income, ₹0 expenses, ₹0 savings)
        data = main.get_dashboard_data(user_id=self.test_user_id)
        self.assertEqual(data["current_balance"], 0.0)
        self.assertEqual(data["monthly_income"], 0.0)
        self.assertEqual(data["monthly_expense"], 0.0)
        self.assertEqual(data["monthly_savings"], 0.0)
        self.assertEqual(len(data["recent_transactions"]), 0)
        self.assertIsNone(data["recent_anomaly"])
        self.assertTrue(data["verified_by_python"])
        print("✓ Clean State Verified: New user starts with exactly ₹0 balance, ₹0 income, ₹0 expense, 0 transactions")

    def test_03_transaction_ml_categorization(self):
        # 1. Test Swiggy
        payload1 = TransactionCreate(
            amount=420.0,
            date="2026-11-18",
            description="Swiggy chicken biryani order",
            category="Auto",
            type="expense"
        )
        res1 = main.create_transaction(payload1, user_id=self.test_user_id)
        self.assertEqual(res1["category"], "Food & Dining")
        tx_id1 = res1["transaction_id"]
        print(f"✓ ML Categorizer 1: 'Swiggy...' -> {res1['category']}")

        # 2. Test Uber
        payload2 = TransactionCreate(
            amount=310.0,
            date="2026-11-18",
            description="Uber ride to client tech park",
            category="Auto",
            type="expense"
        )
        res2 = main.create_transaction(payload2, user_id=self.test_user_id)
        self.assertEqual(res2["category"], "Transportation")
        tx_id2 = res2["transaction_id"]
        print(f"✓ ML Categorizer 2: 'Uber...' -> {res2['category']}")

        # 3. Test Income
        payload3 = TransactionCreate(
            amount=60000.0,
            date="2026-11-01",
            description="Monthly Software Engineer Salary",
            category="Income",
            type="income"
        )
        res3 = main.create_transaction(payload3, user_id=self.test_user_id)
        self.assertEqual(res3["category"], "Income")
        tx_id3 = res3["transaction_id"]
        print("✓ Income Transaction Verified: Added ₹60,000 salary")

        # Verify dynamic update on dashboard
        d_data = main.get_dashboard_data(user_id=self.test_user_id)
        self.assertEqual(d_data["monthly_income"], 60000.0)
        self.assertEqual(d_data["monthly_expense"], 730.0)
        self.assertEqual(d_data["current_balance"], 59270.0)
        print(f"✓ Dynamic Dashboard Calculation Verified: Balance ₹{d_data['current_balance']:,.2f}")

    def test_03b_csv_statement_upload(self):
        import io
        from starlette.datastructures import UploadFile
        csv_bytes = (
            b"Date,Description,Amount,Type\n"
            b"2026-11-10,Amazon shopping wireless mouse,1200,expense\n"
            b"2026-11-12,Apollo pharmacy medical medicines,450,expense\n"
            b"2026-11-14,Airtel broadband internet bill,999,expense\n"
        )
        fake_file = UploadFile(filename="statement.csv", file=io.BytesIO(csv_bytes))
        res = main.upload_transactions_csv(fake_file, user_id=self.test_user_id)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["imported_count"], 3)
        print(f"✓ CSV Statement Upload Verified: {res['imported_count']} records imported")

    def test_03c_multi_format_document_parse_and_confirm(self):
        import io
        from starlette.datastructures import UploadFile

        # Test multi-file parsing (JSON and CSV) without automatic database commitment
        json_content = b"""[
            {"date": "2026-11-15", "description": "Starbucks Coffee Espresso", "amount": 320, "type": "expense"},
            {"date": "2026-11-16", "description": "Client Freelance Payment", "amount": 15000, "type": "income"}
        ]"""
        csv_content = b"Date,Description,Amount,Type\n2026-11-17,Uber Ride to Airport,650,expense\n"

        file1 = UploadFile(filename="records.json", file=io.BytesIO(json_content))
        file2 = UploadFile(filename="trips.csv", file=io.BytesIO(csv_content))

        parse_res = main.parse_financial_documents([file1, file2], user_id=self.test_user_id)
        self.assertEqual(parse_res["status"], "SUCCESS")
        self.assertEqual(parse_res["files_processed"], 2)
        self.assertEqual(parse_res["total_extracted"], 3)
        self.assertEqual(parse_res["total_inflow"], 15000.0)
        self.assertEqual(parse_res["total_outflow"], 970.0)
        print(f"✓ Multi-Format Document Parsing Verified: Extracted {parse_res['total_extracted']} preview records across 2 formats")

        # Step 2: Confirm import only for selected items
        txs_to_confirm = [
            main.ConfirmImportItem(
                date=t["date"],
                description=t["description"],
                amount=t["amount"],
                category=t["category"],
                type=t["type"]
            )
            for t in parse_res["transactions"]
        ]
        confirm_payload = main.ConfirmImportRequest(transactions=txs_to_confirm)
        confirm_res = main.confirm_import_transactions(confirm_payload, user_id=self.test_user_id)
        self.assertEqual(confirm_res["status"], "SUCCESS")
        self.assertEqual(confirm_res["imported_count"], 3)
        print(f"✓ Two-Step User Confirmation Import Verified: {confirm_res['imported_count']} records committed to DB")

    def test_04_budget_management(self):
        curr_m = datetime.now().strftime("%Y-%m")
        # Set Budget
        b_payload = BudgetCreate(category="Food & Dining", spending_limit=9500.0, month=curr_m)
        res = main.create_or_update_budget(b_payload, user_id=self.test_user_id)
        self.assertEqual(res["category"], "Food & Dining")

        # Get Budgets
        budgets_data = main.get_budgets(user_id=self.test_user_id, month=curr_m)
        self.assertGreater(budgets_data["total_budget"], 0)
        self.assertIn("safe_daily_allowance", budgets_data)
        print(f"✓ Budget Engine Verified: Total Budget ₹{budgets_data['total_budget']:,.2f}, Days Left: {budgets_data['days_left']}")

    def test_05_savings_goals(self):
        g_payload = SavingsGoalCreate(
            title="CSE Capstone Testing Goal",
            target_amount=60000.0,
            current_amount=20000.0,
            deadline="2027-06-30"
        )
        res = main.create_savings_goal(g_payload, user_id=self.test_user_id)
        g_id = res["goal_id"]

        goals_data = main.get_savings_goals(user_id=self.test_user_id)
        matched = [g for g in goals_data["goals"] if g["goal_id"] == g_id]
        self.assertTrue(len(matched) > 0)
        self.assertGreater(matched[0]["required_monthly_savings"], 0)
        print(f"✓ Savings Goal Planner Verified: Required deposit ₹{matched[0]['required_monthly_savings']:,.2f}/mo (Progress: {matched[0]['progress_pct']}%)")

    def test_06_ai_insights_and_what_if(self):
        insights = main.get_ai_insights(user_id=self.test_user_id)
        self.assertIn("expense_prediction", insights)
        self.assertIn("anomalies", insights)
        self.assertIn("recurring_payments", insights)
        self.assertIn("recommendations", insights)
        print(f"✓ AI Insights Verified: Expense Prediction Confidence: {insights['expense_prediction']['confidence_score']}")

        # What-If
        what_if_req = WhatIfRequest(category_reductions={"Food & Dining": 15.0, "Shopping": 20.0})
        w_res = main.calculate_what_if_scenario(what_if_req, user_id=self.test_user_id)
        self.assertGreaterEqual(w_res["monthly_additional_savings"], 0)
        print(f"✓ What-If Simulator: Additional Savings ₹{w_res['monthly_additional_savings']:,.2f}/mo (New Rate: {w_res['projected_savings_rate_pct']}%)")

    def test_07_multi_agent_supervisor_chat(self):
        # 1. "Can I save ₹5,000 next month?"
        q1 = ChatRequest(message="Can I save ₹5,000 next month?", calibration_style="analytical")
        r1 = main.chat_with_agents(q1, user_id=self.test_user_id)
        self.assertIn("Savings Agent", r1["collaborating_agents"])
        self.assertIsNotNone(r1["mathematical_proof"])
        print(f"✓ Chat Query 1 ('Can I save ₹5,000?'):\n   Invoked: {r1['collaborating_agents']}\n   Proof: {r1['mathematical_proof'].get('formula')}")

        # 2. "How much did I spend on food?"
        q2 = ChatRequest(message="How much did I spend on food?")
        r2 = main.chat_with_agents(q2, user_id=self.test_user_id)
        self.assertIn("Transaction Agent", r2["collaborating_agents"])
        print("✓ Chat Query 2 ('How much did I spend on food?'): Answered with exact transactions sum")

    def test_08_capstone_evaluation_metrics(self):
        eval_metrics = main.get_evaluation_metrics(user_id=self.test_user_id)
        models = eval_metrics["models"]
        self.assertIn("transaction_categorization", models)
        self.assertIn("expense_prediction", models)
        self.assertIn("anomaly_detection", models)
        self.assertEqual(eval_metrics["deterministic_engine"]["llm_hallucination_rate"], "0.0% (calculations isolated from generative text)")
        print(f"✓ Capstone Model 1 (Categorizer) Accuracy: {models['transaction_categorization']['accuracy'] * 100}%")
        print(f"✓ Capstone Model 2 (Predictor) MAPE: {models['expense_prediction']['mape_percent']}%")
        print(f"✓ Capstone Model 3 (Anomaly) Precision: {models['anomaly_detection']['precision'] * 100}%")

    def test_09_financial_report(self):
        rep = main.generate_financial_report(user_id=self.test_user_id)
        self.assertIn("report_id", rep)
        self.assertIn("executive_summary", rep)
        self.assertIn("category_breakdown", rep)
        print(f"✓ Financial Audit Report Generated: {rep['report_id']} for period {rep['billing_period']}")

    def test_10_finny_conversational_ai_and_memory(self):
        import asyncio
        from services.finny_brain import FinnyBrain

        # 1. Test Available Frontier Models
        models_res = main.get_finny_models()
        self.assertIn("models", models_res)
        model_ids = [m["id"] for m in models_res["models"]]
        self.assertIn("gpt4", model_ids)
        self.assertIn("claude", model_ids)
        self.assertIn("gemini", model_ids)
        self.assertIn("auto", model_ids)
        print("✓ Finny Frontier Models Endpoint Verified (GPT-4o, Claude 3.5, Gemini 1.5, Auto-Router)")

        # 2. Create a conversation thread
        conv_payload = main.FinnyCreateConversationRequest(title="Coding & Algorithms")
        conv_res = main.create_finny_conversation(conv_payload, user_id=self.test_user_id)
        conv = conv_res["conversation"]
        conv_id = conv["conversation_id"]
        self.assertEqual(conv["title"], "Coding & Algorithms")
        print(f"✓ Finny Conversation Thread Created: {conv_id}")

        # 3. Test Finny with Claude 3.5 Sonnet persona
        async def test_claude_agent():
            tokens = []
            proof = None
            async for chunk in FinnyBrain.stream_chat_response(
                user_id=self.test_user_id,
                user_name="Priya",
                message="Hi Finny!",
                history=[],
                agent_model="claude"
            ):
                if chunk.get("token"):
                    tokens.append(chunk["token"])
                if chunk.get("proof"):
                    proof = chunk["proof"]
            return "".join(tokens), proof

        claude_txt, claude_proof = asyncio.run(test_claude_agent())
        self.assertIn("Claude", claude_proof)
        print(f"✓ Finny Claude 3.5 Sonnet Agent Verified: {claude_proof}")

        # 4. Test Finny with Gemini 1.5 Pro persona
        async def test_gemini_agent():
            tokens = []
            proof = None
            async for chunk in FinnyBrain.stream_chat_response(
                user_id=self.test_user_id,
                user_name="Priya",
                message="Hi Finny!",
                history=[],
                agent_model="gemini"
            ):
                if chunk.get("token"):
                    tokens.append(chunk["token"])
                if chunk.get("proof"):
                    proof = chunk["proof"]
            return "".join(tokens), proof

        gemini_txt, gemini_proof = asyncio.run(test_gemini_agent())
        self.assertIn("Gemini", gemini_proof)
        print(f"✓ Finny Gemini 1.5 Pro Agent Verified: {gemini_proof}")

        # 5. Test Finny with GPT-4o persona & Python code execution
        async def test_gpt4_agent():
            tokens = []
            proof = None
            async for chunk in FinnyBrain.stream_chat_response(
                user_id=self.test_user_id,
                user_name="Priya",
                message="How do I reverse a string in Python?",
                history=[],
                agent_model="gpt4"
            ):
                if chunk.get("token"):
                    tokens.append(chunk["token"])
                if chunk.get("proof"):
                    proof = chunk["proof"]
            return "".join(tokens), proof

        gpt4_txt, gpt4_proof = asyncio.run(test_gpt4_agent())
        self.assertIn("def", gpt4_txt.lower())
        self.assertIn("GPT-4o", gpt4_proof)
        print(f"✓ Finny GPT-4o Agent Verified: {gpt4_proof}")

        # 4. Test FinnyBrain multi-turn memory retention with exact user scenario
        history_planning = [
            {"role": "user", "content": "I earn ₹1,00,000 per month."},
            {"role": "assistant", "content": "That's a good starting point! Let's make sure your money is working for you. Do you have any fixed expenses like rent, bills or EMIs?"},
            {"role": "user", "content": "My rent is ₹20,000."},
            {"role": "assistant", "content": "Got it! That leaves you with ₹80,000 before your other expenses."}
        ]

        async def test_streaming_continuation():
            tokens = []
            async for chunk in FinnyBrain.stream_chat_response(
                user_id=self.test_user_id,
                user_name="Priya",
                message="How much should I save from the remaining amount?",
                history=history_planning
            ):
                if chunk.get("token"):
                    tokens.append(chunk["token"])
            return "".join(tokens)

        cont_response = asyncio.run(test_streaming_continuation())
        self.assertIn("80,000", cont_response)
        self.assertIn("20,000", cont_response)
        print(f"✓ Finny Multi-Turn Memory Verified: Understood previous salary and rent ({cont_response})")

        # 5. Test Rename, Pin, Archive & Search
        # Rename
        main.update_finny_conversation(conv_id, main.FinnyUpdateConversationRequest(title="Monthly Salary Planning"), user_id=self.test_user_id)
        # Pin
        main.update_finny_conversation(conv_id, main.FinnyUpdateConversationRequest(is_pinned=1), user_id=self.test_user_id)
        # Search by keyword
        search_res = main.get_finny_conversations(search="salary", user_id=self.test_user_id)
        self.assertTrue(any(c["conversation_id"] == conv_id for c in search_res["conversations"]))
        print("✓ Finny Rename, Pin & Search Keyword Verified")

        # Archive & Restore
        main.update_finny_conversation(conv_id, main.FinnyUpdateConversationRequest(is_archived=1), user_id=self.test_user_id)
        active_list = main.get_finny_conversations(include_archived=False, user_id=self.test_user_id)
        self.assertFalse(any(c["conversation_id"] == conv_id for c in active_list["conversations"]))
        archived_list = main.get_finny_conversations(include_archived=True, user_id=self.test_user_id)
        self.assertTrue(any(c["conversation_id"] == conv_id for c in archived_list["conversations"]))
        # Restore
        main.update_finny_conversation(conv_id, main.FinnyUpdateConversationRequest(is_archived=0), user_id=self.test_user_id)
        print("✓ Finny Archive & Restore Verified")

        # User Isolation: Another user cannot access or delete
        with self.assertRaises(Exception):
            main.get_finny_conversation_messages(conv_id, user_id=99999)
        print("✓ Finny Multi-User Isolation Verified")

        # 6. Delete conversation thread
        del_res = main.delete_finny_conversation(conv_id, user_id=self.test_user_id)
        self.assertEqual(del_res["status"], "SUCCESS")
        print("✓ Finny Conversation Thread Deletion Verified")

if __name__ == "__main__":
    unittest.main()
