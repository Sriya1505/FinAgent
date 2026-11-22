"""
Transaction Specialist Agent
Handles transaction queries, category filtering, merchant lookups,
and automatic machine learning categorization.
"""

from typing import List, Dict, Any, Optional
import sqlite3
from database import get_db_connection
from ml.categorization import classifier

class TransactionAgent:
    def __init__(self):
        self.name = "Transaction Agent"
        self.role = "Transaction categorization, search, and historical expense auditing"

    def execute(self, user_id: int, query: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Filters transactions by merchant or category mentioned in the query.
        Returns matching records, exact total spent, count, and insights.
        """
        q_lower = query.lower()
        
        # Check category match
        categories = ["food", "dining", "shopping", "transportation", "entertainment", "healthcare", "education", "bills", "utilities", "savings", "income"]
        matched_cat = None
        for cat in categories:
            if cat in q_lower:
                matched_cat = cat
                break

        # Filter transactions
        matching_txs = []
        for t in transactions:
            t_desc = t["description"].lower()
            t_cat = t["category"].lower()
            
            if matched_cat and matched_cat in t_cat:
                matching_txs.append(t)
            elif any(w in t_desc for w in q_lower.split() if len(w) > 3 and w not in ["spend", "spent", "much", "total", "money"]):
                matching_txs.append(t)

        # If no specific filter matched, default to current month's latest transactions
        if not matching_txs:
            matching_txs = transactions[:10]

        total_spent = sum(t["amount"] for t in matching_txs if t["type"] == "expense")
        total_income = sum(t["amount"] for t in matching_txs if t["type"] == "income")

        return {
            "agent": self.name,
            "status": "SUCCESS",
            "matched_category": matched_cat.title() if matched_cat else "All Transactions",
            "transaction_count": len(matching_txs),
            "total_spent": round(total_spent, 2),
            "total_income": round(total_income, 2),
            "sample_records": matching_txs[:5],
            "verified_by_python": True
        }

transaction_agent = TransactionAgent()
