"""
Deterministic Python Financial Calculation Engine
Performs all mathematical operations, validations, budget metrics,
what-if scenarios, recurring expense detection, and statistical summaries.
The LLM never performs independent financial arithmetic.
"""

from datetime import datetime, date
import math
from typing import List, Dict, Any, Optional, Tuple

class FinancialEngine:
    @staticmethod
    def calculate_savings(income: float, expenses: float) -> float:
        """Net savings = total income - total expenses"""
        return round(float(income) - float(expenses), 2)

    @staticmethod
    def budget_remaining(budget_limit: float, spent: float) -> float:
        """Remaining budget in currency units"""
        return round(float(budget_limit) - float(spent), 2)

    @staticmethod
    def budget_utilization_pct(budget_limit: float, spent: float) -> float:
        """Percentage of budget consumed"""
        if budget_limit <= 0:
            return 100.0 if spent > 0 else 0.0
        return round((spent / budget_limit) * 100.0, 1)

    @staticmethod
    def savings_rate(income: float, savings: float) -> float:
        """Savings rate percentage = (savings / income) * 100"""
        if income <= 0:
            return 0.0
        return round(max(0.0, (savings / income) * 100.0), 2)

    @staticmethod
    def calculate_required_savings(target: float, current: float, months: int) -> float:
        """Monthly savings needed to reach target goal within remaining months"""
        if months <= 0:
            raise ValueError("Months must be a positive integer greater than 0")
        remaining = max(0.0, float(target) - float(current))
        return round(remaining / months, 2)

    @staticmethod
    def days_remaining_in_month(target_date: Optional[date] = None) -> int:
        """Returns days left in the specified month (including today)"""
        d = target_date or date.today()
        # Next month first day minus 1 day
        if d.month == 12:
            next_month = date(d.year + 1, 1, 1)
        else:
            next_month = date(d.year, d.month + 1, 1)
        last_day = (next_month - date.resolution).day
        return max(1, last_day - d.day + 1)

    @staticmethod
    def safe_daily_spending_allowance(remaining_budget: float, days_left: int) -> float:
        """Safe daily allowance for remaining days in month"""
        if days_left <= 0 or remaining_budget <= 0:
            return 0.0
        return round(remaining_budget / days_left, 2)

    @staticmethod
    def validate_transaction_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validates incoming transaction fields"""
        amount = data.get("amount")
        if amount is None or not isinstance(amount, (int, float)):
            return False, "Amount must be a numeric value."
        if amount <= 0:
            return False, "Amount must be strictly greater than zero."
        if amount > 10_000_000:
            return False, "Amount exceeds single transaction threshold limit (₹10,000,000)."

        tx_type = data.get("type", "").lower()
        if tx_type not in ["income", "expense"]:
            return False, "Transaction type must be 'income' or 'expense'."

        tx_date = data.get("date")
        if not tx_date:
            return False, "Date is required."
        try:
            datetime.strptime(str(tx_date)[:10], "%Y-%m-%d")
        except ValueError:
            return False, "Invalid date format. Expected YYYY-MM-DD."

        desc = data.get("description", "").strip()
        if not desc:
            return False, "Description cannot be empty."

        return True, None

    @staticmethod
    def compute_month_summary(transactions: List[Dict[str, Any]], month_str: str) -> Dict[str, Any]:
        """Calculates income, expense, savings, savings rate, and category sums for a given month (YYYY-MM)"""
        filtered = [t for t in transactions if str(t["date"]).startswith(month_str)]
        
        total_income = sum(t["amount"] for t in filtered if t["type"] == "income")
        total_expense = sum(t["amount"] for t in filtered if t["type"] == "expense")
        net_savings = FinancialEngine.calculate_savings(total_income, total_expense)
        rate = FinancialEngine.savings_rate(total_income, net_savings)

        category_breakdown: Dict[str, float] = {}
        for t in filtered:
            if t["type"] == "expense":
                cat = t.get("category", "Miscellaneous")
                category_breakdown[cat] = round(category_breakdown.get(cat, 0.0) + float(t["amount"]), 2)

        sorted_categories = sorted(category_breakdown.items(), key=lambda x: x[1], reverse=True)

        return {
            "month": month_str,
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "net_savings": round(net_savings, 2),
            "savings_rate_pct": rate,
            "transaction_count": len(filtered),
            "category_breakdown": dict(sorted_categories),
            "top_spending_category": sorted_categories[0][0] if sorted_categories else "None",
            "top_spending_amount": sorted_categories[0][1] if sorted_categories else 0.0,
        }

    @staticmethod
    def detect_recurring_transactions(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detects recurring subscriptions, rent, bills by grouping by description tokens
        and finding repeated occurrences across different calendar months with similar amounts.
        """
        from collections import defaultdict
        grouped = defaultdict(list)
        
        for t in transactions:
            if t["type"] != "expense":
                continue
            # Normalize description
            desc_key = "".join(ch for ch in t["description"].lower() if ch.isalnum() or ch.isspace()).strip()
            # Pick first 2-3 words for grouping (e.g., 'netflix 4k', 'airtel xstream')
            words = desc_key.split()
            short_key = " ".join(words[:2]) if len(words) >= 2 else (words[0] if words else "unknown")
            grouped[short_key].append(t)

        recurring = []
        for key, txs in grouped.items():
            # Check if occurs in more than 1 distinct month or flagged as is_recurring
            distinct_months = set(str(t["date"])[:7] for t in txs)
            flagged = any(t.get("is_recurring", 0) == 1 for t in txs)
            
            if len(distinct_months) >= 2 or flagged:
                amounts = [t["amount"] for t in txs]
                avg_amount = sum(amounts) / len(amounts)
                # Check consistency (standard deviation is low)
                variance = sum((a - avg_amount) ** 2 for a in amounts) / len(amounts)
                std_dev = math.sqrt(variance)
                
                # If amounts are within 20% or explicitly flagged
                if std_dev <= (avg_amount * 0.25) or flagged:
                    sample = txs[-1]
                    recurring.append({
                        "name": sample["description"],
                        "category": sample["category"],
                        "average_amount": round(avg_amount, 2),
                        "frequency": "Monthly",
                        "last_billed": sample["date"],
                        "occurrences": len(txs),
                        "annual_cost": round(avg_amount * 12, 2)
                    })

        return sorted(recurring, key=lambda x: x["average_amount"], reverse=True)

    @staticmethod
    def what_if_analysis(current_income: float, current_expense: float, category_reductions: Dict[str, float], category_totals: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculates the financial outcome if the user reduces spending in specified categories.
        category_reductions: e.g. {"Food & Dining": 15.0, "Shopping": 20.0} (percentages)
        """
        total_saved_monthly = 0.0
        breakdown = []

        for cat, reduction_pct in category_reductions.items():
            spent = category_totals.get(cat, 0.0)
            if spent > 0 and reduction_pct > 0:
                saved = (spent * (reduction_pct / 100.0))
                new_spent = spent - saved
                total_saved_monthly += saved
                breakdown.append({
                    "category": cat,
                    "original_spent": round(spent, 2),
                    "reduction_pct": reduction_pct,
                    "monthly_saved": round(saved, 2),
                    "new_spent": round(new_spent, 2),
                })

        new_total_expense = max(0.0, current_expense - total_saved_monthly)
        new_savings = current_income - new_total_expense
        current_savings = current_income - current_expense
        
        current_rate = FinancialEngine.savings_rate(current_income, current_savings)
        new_rate = FinancialEngine.savings_rate(current_income, new_savings)

        return {
            "current_expense": round(current_expense, 2),
            "new_expense": round(new_total_expense, 2),
            "monthly_additional_savings": round(total_saved_monthly, 2),
            "annual_additional_savings": round(total_saved_monthly * 12, 2),
            "current_savings_rate_pct": current_rate,
            "projected_savings_rate_pct": new_rate,
            "rate_increase_pct": round(new_rate - current_rate, 2),
            "category_breakdown": breakdown
        }
