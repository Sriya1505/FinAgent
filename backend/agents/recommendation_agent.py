"""
Recommendation Specialist Agent
Generates grounded, personalized, explainable financial tips based on
budget variances, subscription creep, and spending spikes.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
from services.finance_engine import FinancialEngine

class RecommendationAgent:
    def __init__(self):
        self.name = "Recommendation Agent"
        self.role = "Personalized financial recommendations, savings optimizations, and explainable insights"

    def execute(self, user_id: int, query: str, transactions: List[Dict[str, Any]], budgets: List[Dict[str, Any]]) -> Dict[str, Any]:
        today = datetime.now()
        curr_month = today.strftime("%Y-%m")
        last_month = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

        curr_summary = FinancialEngine.compute_month_summary(transactions, curr_month)
        last_summary = FinancialEngine.compute_month_summary(transactions, last_month)

        recommendations = []

        # 1. Compare category spending changes (Explainable AI)
        for cat, curr_spent in curr_summary["category_breakdown"].items():
            last_spent = last_summary["category_breakdown"].get(cat, 0.0)
            if last_spent > 0:
                diff = curr_spent - last_spent
                pct_change = round((diff / last_spent) * 100.0, 1)
                if pct_change >= 15.0 and diff > 500:
                    recommendations.append({
                        "category": cat,
                        "type": "SPENDING_INCREASE",
                        "priority": "HIGH" if pct_change > 30 else "MEDIUM",
                        "title": f"Spike in {cat} Expenditure",
                        "recommendation": f"Your {cat.lower()} spending increased by {pct_change}% compared to last month.",
                        "reason": f"You spent ₹{curr_spent:,.0f} this month versus ₹{last_spent:,.0f} last month (+₹{diff:,.0f}).",
                        "potential_monthly_savings": round(diff * 0.5, 2),
                        "suggested_action": f"Set a weekly spending cap of ₹{round(last_spent / 4, 0):,.0f} on {cat.lower()}."
                    })

        # 2. Check Recurring Subscriptions
        recurring = FinancialEngine.detect_recurring_transactions(transactions)
        total_sub_annual = sum(r["annual_cost"] for r in recurring)
        if recurring:
            recommendations.append({
                "category": "Subscriptions",
                "type": "SUBSCRIPTION_AUDIT",
                "priority": "MEDIUM",
                "title": f"Recurring Commitments: {len(recurring)} Active Services",
                "recommendation": f"You are committed to ₹{sum(r['average_amount'] for r in recurring):,.0f}/month across {len(recurring)} recurring subscriptions.",
                "reason": f"Annualized recurring commitment equals ₹{total_sub_annual:,.0f}. Audit subscriptions like {recurring[0]['name']}.",
                "potential_monthly_savings": round(sum(r['average_amount'] for r in recurring[:2]), 2),
                "suggested_action": "Cancel unused memberships or convert single plans to annual/family plans."
            })

        # 3. Check Savings Rate Benchmarks
        savings_rate = curr_summary["savings_rate_pct"]
        if savings_rate < 20.0:
            recommendations.append({
                "category": "Savings",
                "type": "SAVINGS_RATE_ALERT",
                "priority": "HIGH",
                "title": "Savings Rate Below 20% Benchmark",
                "recommendation": f"Your current savings rate is {savings_rate}%, below the 50/30/20 guideline (20%).",
                "reason": f"Total income ₹{curr_summary['total_income']:,.0f} minus expenses ₹{curr_summary['total_expense']:,.0f} leaves net savings of ₹{curr_summary['net_savings']:,.0f}.",
                "potential_monthly_savings": round(curr_summary["total_income"] * 0.20 - curr_summary["net_savings"], 2),
                "suggested_action": "Automate an initial 10% SIP transfer immediately on salary credit day."
            })

        return {
            "agent": self.name,
            "status": "SUCCESS",
            "recommendations_count": len(recommendations),
            "recommendations": recommendations,
            "verified_by_python": True
        }

recommendation_agent = RecommendationAgent()
