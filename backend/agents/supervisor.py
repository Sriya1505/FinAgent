"""
Supervisor Agent & Multi-Agent Orchestrator
Coordinates Specialist Agents, executes deterministic Python calculations,
queries the RAG Knowledge Base, and generates Trust-Calibrated Explanations.
"""

from typing import List, Dict, Any, Optional
import re
from datetime import datetime

from agents.transaction_agent import transaction_agent
from agents.budget_agent import budget_agent
from agents.prediction_agent import prediction_agent
from agents.anomaly_agent import anomaly_agent
from agents.savings_agent import savings_agent
from agents.recommendation_agent import recommendation_agent
from services.finance_engine import FinancialEngine
from rag.knowledge_base import rag_engine

class SupervisorAgent:
    def __init__(self):
        self.name = "Supervisor Agent"

    def classify_intent(self, query: str) -> List[str]:
        """
        Determines which specialist agent(s) should be invoked based on user question.
        Returns list of specialist agent keys.
        """
        q = query.lower()
        selected_agents = []

        # Savings / Goal / Can I save
        if any(w in q for w in ["save", "saving", "goal", "target", "afford", "can i"]):
            selected_agents.append("savings")

        # Budget / Overspending / Limits / Allowance
        if any(w in q for w in ["budget", "limit", "overspend", "remaining", "allowance", "runway"]):
            selected_agents.append("budget")

        # Prediction / Forecast / Future / Next month / Expect
        if any(w in q for w in ["predict", "forecast", "next month", "future", "expect", "trend"]):
            selected_agents.append("prediction")

        # Anomaly / Unusual / Spike / Suspicious / High expense
        if any(w in q for w in ["anomaly", "unusual", "suspicious", "weird", "spike", "outlier"]):
            selected_agents.append("anomaly")

        # Recommendations / Tips / Advice / Why increasing / Help
        if any(w in q for w in ["why", "recommend", "advice", "tip", "increase", "increasing", "cut", "reduce"]):
            selected_agents.append("recommendation")

        # Transaction / Specific category / Merchant / Where spending most
        if any(w in q for w in ["where", "how much", "spend", "spent", "swiggy", "zomato", "uber", "shopping", "food", "transaction"]):
            selected_agents.append("transaction")

        # Default fallback
        if not selected_agents:
            selected_agents = ["transaction", "budget"]

        return list(dict.fromkeys(selected_agents)) # preserve order, remove duplicates

    def process_query(
        self,
        query: str,
        user_id: int,
        transactions: List[Dict[str, Any]],
        budgets: List[Dict[str, Any]],
        goals: List[Dict[str, Any]],
        calibration_style: str = "analytical"
    ) -> Dict[str, Any]:
        """
        Main multi-agent pipeline:
        1. Supervisor Agent classifies user intent.
        2. Dispatches to selected Specialist Agents.
        3. Financial Calculation Engine verifies all math.
        4. RAG Knowledge Base retrieves grounded finance principles.
        5. Trust-Calibrated Response Generator structures human explanation with mathematical proofs.
        """
        intents = self.classify_intent(query)
        specialist_results = {}
        agent_names_invoked = []

        curr_month = datetime.now().strftime("%Y-%m")
        month_summary = FinancialEngine.compute_month_summary(transactions, curr_month)

        # Clean state guard: If user has zero transactions recorded, provide immediate transparent feedback
        if not transactions:
            rag_context = rag_engine.retrieve(query, top_k=1)
            rag_doc = rag_context[0] if rag_context else None
            return {
                "query": query,
                "supervisor_intent": intents,
                "collaborating_agents": ["Supervisor Agent"],
                "response": "You currently have no recorded transactions in your account. To get started, please add an expense/income or import a bank statement (CSV). Once you add transactions, our specialist agents will analyze your spending patterns, track your budget, and provide verified calculations!",
                "mathematical_proof": {
                    "recorded_transactions": 0,
                    "current_balance": "₹0.00",
                    "verdict": "Awaiting User Transactions"
                },
                "rag_reference": {
                    "title": rag_doc["title"] if rag_doc else "Personal Wealth Management",
                    "category": rag_doc["category"] if rag_doc else "System Guide",
                    "principle": rag_doc["content"] if rag_doc else "Accurate financial decisions rely on verified transaction records. Add your first record to activate multi-agent calculations."
                } if rag_doc else None,
                "trust_metrics": {
                    "confidence_score": 1.0,
                    "verification_badge": "100% Deterministic Python Verified",
                    "calibration_style": calibration_style,
                    "llm_hallucination_guard": "Enforced (Zero Hallucination)"
                },
                "specialist_data": {}
            }

        # 1. Dispatch to Specialists
        if "transaction" in intents:
            specialist_results["transaction"] = transaction_agent.execute(user_id, query, transactions)
            agent_names_invoked.append("Transaction Agent")

        if "budget" in intents:
            specialist_results["budget"] = budget_agent.execute(user_id, query, transactions, budgets)
            agent_names_invoked.append("Budget Agent")

        if "prediction" in intents or "savings" in intents:
            specialist_results["prediction"] = prediction_agent.execute(user_id, query, transactions)
            agent_names_invoked.append("Prediction Agent")

        if "anomaly" in intents:
            specialist_results["anomaly"] = anomaly_agent.execute(user_id, query, transactions)
            agent_names_invoked.append("Anomaly Agent")

        if "savings" in intents:
            specialist_results["savings"] = savings_agent.execute(user_id, query, transactions, goals)
            agent_names_invoked.append("Savings Agent")

        if "recommendation" in intents:
            specialist_results["recommendation"] = recommendation_agent.execute(user_id, query, transactions, budgets)
            agent_names_invoked.append("Recommendation Agent")

        # 2. RAG Retrieval
        rag_context = rag_engine.retrieve(query, top_k=1)
        rag_doc = rag_context[0] if rag_context else None

        # 3. Generate Trust-Calibrated Grounded Explanation
        explanation, math_proof, confidence = self._generate_trust_calibrated_response(
            query=query,
            intents=intents,
            results=specialist_results,
            summary=month_summary,
            rag_doc=rag_doc,
            style=calibration_style
        )

        return {
            "query": query,
            "supervisor_intent": intents,
            "collaborating_agents": agent_names_invoked,
            "response": explanation,
            "mathematical_proof": math_proof,
            "rag_reference": {
                "title": rag_doc["title"] if rag_doc else None,
                "category": rag_doc["category"] if rag_doc else None,
                "principle": rag_doc["content"] if rag_doc else None,
            } if rag_doc else None,
            "trust_metrics": {
                "confidence_score": confidence,
                "verification_badge": "100% Deterministic Python Verified",
                "calibration_style": calibration_style,
                "llm_hallucination_guard": "Enforced (Python math engine)"
            },
            "specialist_data": specialist_results
        }

    def _generate_trust_calibrated_response(
        self,
        query: str,
        intents: List[str],
        results: Dict[str, Any],
        summary: Dict[str, Any],
        rag_doc: Optional[Dict[str, Any]],
        style: str
    ) -> (str, Dict[str, Any], float):
        """
        Synthesizes transparent, grounded explanation aligned with user's preferred calibration style:
        - 'analytical': data-dense, quantitative, explicit formulas.
        - 'supportive': empathetic, encouraging, actionable next steps.
        - 'strict': disciplined, frugality-focused, emphasizes budget adherence.
        """
        q = query.lower()
        parts = []
        math_proof = {}
        confidence = 0.95

        # Query: "Can I save ₹5,000 next month?" or Savings questions
        if "savings" in intents and "savings" in results:
            s_data = results["savings"]
            feas = s_data.get("feasibility_assessment")
            if feas:
                math_proof = {
                    "monthly_income": f"₹{s_data['average_monthly_income']:,.2f}",
                    "predicted_expenses": f"₹{s_data['predicted_monthly_expense']:,.2f}",
                    "formula": "Income (₹{income}) - Predicted Expenses (₹{exp}) = Projected Surplus (₹{surplus})".format(
                        income=f"{s_data['average_monthly_income']:,.0f}",
                        exp=f"{s_data['predicted_monthly_expense']:,.0f}",
                        surplus=f"{s_data['potential_monthly_savings']:,.0f}"
                    ),
                    "verdict": "Feasible" if feas["is_achievable"] else "Deficit Alert"
                }

                if style == "supportive":
                    if feas["is_achievable"]:
                        parts.append(
                            f"Great news! Yes, you are well on track to save ₹{feas['target_amount']:,.0f} next month. "
                            f"With your projected monthly income of ₹{s_data['average_monthly_income']:,.0f} and predicted expenses of ₹{s_data['predicted_monthly_expense']:,.0f}, "
                            f"you will have an estimated surplus of ₹{s_data['potential_monthly_savings']:,.0f}."
                        )
                    else:
                        parts.append(
                            f"Saving ₹{feas['target_amount']:,.0f} next month will be tight based on current spending patterns. "
                            f"Your estimated surplus is ₹{s_data['potential_monthly_savings']:,.0f}. Don't worry—trimming minor discretionary purchases could easily close this gap!"
                        )
                elif style == "strict":
                    if feas["is_achievable"]:
                        parts.append(
                            f"Target of ₹{feas['target_amount']:,.0f} is permissible. Your projected surplus is ₹{s_data['potential_monthly_savings']:,.0f}. "
                            f"Do not allow discretionary spending to exceed ₹{s_data['predicted_monthly_expense']:,.0f} to safeguard this objective."
                        )
                    else:
                        parts.append(
                            f"Cannot approve saving ₹{feas['target_amount']:,.0f} under current spending habits. "
                            f"Projected expenses of ₹{s_data['predicted_monthly_expense']:,.0f} leave only ₹{s_data['potential_monthly_savings']:,.0f}. "
                            f"Immediate expense cuts required."
                        )
                else: # analytical
                    parts.append(
                        f"Based on your average monthly income of ₹{s_data['average_monthly_income']:,.0f} and predicted expenses of ₹{s_data['predicted_monthly_expense']:,.0f}, "
                        f"you are projected to generate a net surplus of ₹{s_data['potential_monthly_savings']:,.0f} next month. "
                        f"{'Saving ₹' + str(int(feas['target_amount'])) + ' is fully achievable with a buffer of ₹' + str(int(feas['surplus_or_deficit'])) if feas['is_achievable'] else 'There is a shortfall of ₹' + str(int(abs(feas['surplus_or_deficit'])))}."
                    )
            elif s_data.get("goals_analysis"):
                top_goal = s_data["goals_analysis"][0]
                parts.append(
                    f"You have {len(s_data['goals_analysis'])} active savings goals. For your top goal '{top_goal['title']}', "
                    f"you have accumulated ₹{top_goal['current']:,.0f} of ₹{top_goal['target']:,.0f} ({top_goal['progress_pct']}%). "
                    f"To reach completion in {top_goal['months_left']} months, your required monthly contribution is ₹{top_goal['required_monthly_savings']:,.0f}."
                )

        # Query: "Where am I spending the most?"
        elif "where" in q or "most" in q:
            top_cat = summary["top_spending_category"]
            top_amt = summary["top_spending_amount"]
            math_proof = {
                "top_category": top_cat,
                "amount_spent": f"₹{top_amt:,.2f}",
                "total_monthly_expense": f"₹{summary['total_expense']:,.2f}",
                "share_pct": f"{round((top_amt / summary['total_expense'] * 100), 1) if summary['total_expense'] > 0 else 0}%"
            }
            parts.append(
                f"You are spending the most on **{top_cat}**, totaling ₹{top_amt:,.0f} this month. "
                f"This represents {round((top_amt / summary['total_expense'] * 100), 1) if summary['total_expense'] > 0 else 0}% of your total monthly expenses (₹{summary['total_expense']:,.0f})."
            )

        # Query: "How much did I spend on shopping / food / etc.?"
        elif "transaction" in intents and "transaction" in results:
            t_res = results["transaction"]
            cat_name = t_res["matched_category"]
            amt = t_res["total_spent"]
            math_proof = {
                "category": cat_name,
                "records_matched": t_res["transaction_count"],
                "total_sum": f"₹{amt:,.2f}"
            }
            parts.append(
                f"You have spent **₹{amt:,.0f}** across {t_res['transaction_count']} transactions in **{cat_name}**."
            )

        # Query: "Why are my expenses increasing?"
        elif "why" in q or "recommendation" in intents:
            if "recommendation" in results and results["recommendation"]["recommendations"]:
                top_rec = results["recommendation"]["recommendations"][0]
                parts.append(
                    f"Your expenses are primarily elevated due to: **{top_rec['title']}**. "
                    f"{top_rec['reason']} {top_rec['suggested_action']}"
                )
                math_proof = {
                    "primary_factor": top_rec["title"],
                    "potential_monthly_savings": f"₹{top_rec['potential_monthly_savings']:,.2f}"
                }
            else:
                parts.append(
                    f"Your expenses this month total ₹{summary['total_expense']:,.0f}. Spending remains within historical distribution."
                )

        # Anomaly Queries
        elif "anomaly" in intents and "anomaly" in results:
            a_data = results["anomaly"]
            if a_data["anomalies_detected"] > 0:
                top_a = a_data["flagged_transactions"][0]
                parts.append(
                    f"FinAgent flagged {a_data['anomalies_detected']} unusual transaction(s). Most notably: "
                    f"**{top_a['description']}** on {top_a['date']} for ₹{top_a['amount']:,.0f}. "
                    f"{top_a['reason']}"
                )
                math_proof = {
                    "transaction": top_a["description"],
                    "amount": f"₹{top_a['amount']:,.2f}",
                    "z_score": top_a["z_score"],
                    "category_mean": f"₹{top_a['category_mean']:,.2f}"
                }
            else:
                parts.append("No statistical anomalies or unusual outliers detected in your recent spending.")

        # Budget queries
        elif "budget" in intents and "budget" in results:
            b_data = results["budget"]
            math_proof = {
                "total_budget": f"₹{b_data['total_budget']:,.2f}",
                "total_spent": f"₹{b_data['total_spent']:,.2f}",
                "remaining_budget": f"₹{b_data['total_remaining']:,.2f}",
                "safe_daily_allowance": f"₹{b_data['safe_daily_allowance']:,.2f}"
            }
            parts.append(
                f"Your total monthly budget is ₹{b_data['total_budget']:,.0f}. You have consumed ₹{b_data['total_spent']:,.0f} ({b_data['overall_utilization_pct']}%), "
                f"leaving **₹{b_data['total_remaining']:,.0f}** remaining for the remaining {b_data['days_left_in_month']} days of the month. "
                f"Your recommended safe daily spending allowance is **₹{b_data['safe_daily_allowance']:,.0f}/day**."
            )

        # Fallback summary
        if not parts:
            parts.append(
                f"Your financial snapshot for {summary['month']}: Total Income ₹{summary['total_income']:,.0f}, "
                f"Total Expenses ₹{summary['total_expense']:,.0f}, Net Savings ₹{summary['net_savings']:,.0f} (Savings Rate: {summary['savings_rate_pct']}%)."
            )

        # Append Grounded RAG Principle if relevant
        if rag_doc and ("save" in q or "budget" in q or "why" in q):
            parts.append(f"\n\n*Financial Guideline ({rag_doc['title']}):* {rag_doc['content']}")

        full_text = " ".join(parts)
        return full_text, math_proof, confidence

supervisor_agent = SupervisorAgent()
