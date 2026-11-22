"""
Savings Specialist Agent
Evaluates savings goal feasibility, monthly capital requirements,
and what-if spending reduction scenarios.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from services.finance_engine import FinancialEngine
from ml.prediction import predictor

class SavingsAgent:
    def __init__(self):
        self.name = "Savings Agent"
        self.role = "Savings goal planning, feasibility analysis, and what-if simulation"

    def execute(self, user_id: int, query: str, transactions: List[Dict[str, Any]], goals: List[Dict[str, Any]]) -> Dict[str, Any]:
        # 1. Check if user is asking a specific feasibility question, e.g., "Can I save ₹5,000 next month?"
        amt_match = re.search(r'₹?\s*([0-9]+(?:,[0-9]+)*)', query)
        target_ask = None
        if amt_match:
            try:
                target_ask = float(amt_match.group(1).replace(",", ""))
            except ValueError:
                target_ask = None

        # Calculate user's monthly averages
        curr_month = datetime.now().strftime("%Y-%m")
        monthly_incomes = {}
        monthly_expenses = {}
        for t in transactions:
            m = str(t["date"])[:7]
            amt = float(t["amount"])
            if t["type"] == "income":
                monthly_incomes[m] = monthly_incomes.get(m, 0.0) + amt
            else:
                monthly_expenses[m] = monthly_expenses.get(m, 0.0) + amt

        avg_income = sum(monthly_incomes.values()) / max(1, len(monthly_incomes))
        
        # Get next month predicted expenses
        forecast = predictor.forecast_next_month(transactions)
        pred_expense = forecast["predicted_total"]
        
        # Realistic estimated savings
        potential_savings = FinancialEngine.calculate_savings(avg_income, pred_expense)
        current_savings_rate = FinancialEngine.savings_rate(avg_income, potential_savings)

        feasibility = None
        if target_ask is not None and target_ask > 0:
            is_achievable = potential_savings >= target_ask
            gap = round(abs(potential_savings - target_ask), 2)
            feasibility = {
                "target_amount": target_ask,
                "projected_monthly_income": round(avg_income, 2),
                "projected_monthly_expense": round(pred_expense, 2),
                "projected_savings": round(potential_savings, 2),
                "is_achievable": is_achievable,
                "surplus_or_deficit": round(potential_savings - target_ask, 2),
                "recommendation": (
                    f"Yes! Saving ₹{target_ask:,.0f} is fully achievable. Your projected surplus is ₹{potential_savings:,.0f}."
                    if is_achievable else
                    f"Saving ₹{target_ask:,.0f} requires closing a ₹{gap:,.0f} gap. You would need to trim discretionary expenses."
                )
            }

        # Analyze existing savings goals
        goals_analysis = []
        for g in goals:
            target = float(g["target_amount"])
            curr = float(g["current_amount"])
            deadline_str = g["deadline"]
            try:
                dl = datetime.strptime(deadline_str, "%Y-%m-%d")
                months_left = max(1, (dl.year - datetime.now().year) * 12 + (dl.month - datetime.now().month))
            except Exception:
                months_left = 6
            
            req_monthly = FinancialEngine.calculate_required_savings(target, curr, months_left)
            pct_complete = round((curr / target) * 100.0, 1) if target > 0 else 0.0

            goals_analysis.append({
                "title": g["title"],
                "target": target,
                "current": curr,
                "remaining_amount": round(target - curr, 2),
                "months_left": months_left,
                "required_monthly_savings": req_monthly,
                "progress_pct": pct_complete,
                "status": "ON_TRACK" if potential_savings >= req_monthly else "NEEDS_ATTENTION"
            })

        return {
            "agent": self.name,
            "status": "SUCCESS",
            "average_monthly_income": round(avg_income, 2),
            "predicted_monthly_expense": round(pred_expense, 2),
            "potential_monthly_savings": round(potential_savings, 2),
            "projected_savings_rate_pct": current_savings_rate,
            "feasibility_assessment": feasibility,
            "active_goals_count": len(goals),
            "goals_analysis": goals_analysis,
            "verified_by_python": True
        }

savings_agent = SavingsAgent()
