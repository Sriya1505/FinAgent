"""
Budget Specialist Agent
Tracks category-wise spending against configured limits.
Detects budget overruns and calculates remaining safe daily allowance.
"""

from typing import List, Dict, Any
from datetime import datetime, date
from services.finance_engine import FinancialEngine

class BudgetAgent:
    def __init__(self):
        self.name = "Budget Agent"
        self.role = "Budget limit monitoring, overspending alerts, and spending runways"

    def execute(self, user_id: int, query: str, transactions: List[Dict[str, Any]], budgets: List[Dict[str, Any]]) -> Dict[str, Any]:
        curr_month = datetime.now().strftime("%Y-%m")
        curr_expenses = [t for t in transactions if str(t["date"]).startswith(curr_month) and t["type"] == "expense"]

        # Calculate spending by category
        spent_by_cat: Dict[str, float] = {}
        for t in curr_expenses:
            cat = t.get("category", "Miscellaneous")
            spent_by_cat[cat] = round(spent_by_cat.get(cat, 0.0) + float(t["amount"]), 2)

        budget_status = []
        overspent_categories = []
        near_limit_categories = []
        total_budget = sum(b["spending_limit"] for b in budgets)
        total_spent = sum(spent_by_cat.values())

        for b in budgets:
            cat = b["category"]
            limit = float(b["spending_limit"])
            spent = spent_by_cat.get(cat, 0.0)
            remaining = FinancialEngine.budget_remaining(limit, spent)
            utilization = FinancialEngine.budget_utilization_pct(limit, spent)

            status = "HEALTHY"
            if utilization >= 100:
                status = "EXCEEDED"
                overspent_categories.append({"category": cat, "overspend": round(spent - limit, 2), "utilization": utilization})
            elif utilization >= 80:
                status = "WARNING"
                near_limit_categories.append({"category": cat, "remaining": remaining, "utilization": utilization})

            budget_status.append({
                "category": cat,
                "limit": limit,
                "spent": spent,
                "remaining": remaining,
                "utilization_pct": utilization,
                "status": status
            })

        days_left = FinancialEngine.days_remaining_in_month()
        remaining_overall = max(0.0, total_budget - total_spent)
        daily_safe_allowance = FinancialEngine.safe_daily_spending_allowance(remaining_overall, days_left)

        return {
            "agent": self.name,
            "status": "SUCCESS",
            "current_month": curr_month,
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_spent, 2),
            "total_remaining": round(remaining_overall, 2),
            "overall_utilization_pct": FinancialEngine.budget_utilization_pct(total_budget, total_spent),
            "days_left_in_month": days_left,
            "safe_daily_allowance": daily_safe_allowance,
            "budget_breakdown": budget_status,
            "overspent_categories": overspent_categories,
            "near_limit_categories": near_limit_categories,
            "verified_by_python": True
        }

budget_agent = BudgetAgent()
