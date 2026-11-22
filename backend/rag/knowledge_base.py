"""
RAG (Retrieval-Augmented Generation) Financial Knowledge Base
Stores foundational personal finance principles, budgeting formulas,
emergency fund guidelines, and savings rules.
Retrieves contextually relevant financial principles to ground agent responses.
"""

from typing import List, Dict, Any
import re
import math

FINANCIAL_KNOWLEDGE_DOCS = [
    {
        "id": "kb_50_30_20",
        "title": "The 50/30/20 Budgeting Rule",
        "category": "Budgeting",
        "keywords": ["50/30/20", "budget rule", "needs", "wants", "savings percentage", "how to budget"],
        "content": (
            "The 50/30/20 rule is a widely recommended personal finance framework: "
            "1. 50% for Needs: essential expenses like rent, groceries, electricity, medical bills, and minimum loan payments. "
            "2. 30% for Wants: discretionary spending such as dining out, shopping, entertainment, and vacations. "
            "3. 20% for Savings & Debt repayment: emergency fund contributions, retirement accounts, mutual fund SIPs, and extra debt principal. "
            "If your essential expenses exceed 50%, aim to temporarily reduce wants until your savings rate reaches at least 15-20%."
        )
    },
    {
        "id": "kb_emergency_fund",
        "title": "Emergency Fund Guidelines",
        "category": "Savings",
        "keywords": ["emergency fund", "unexpected expenses", "rainy day", "how much emergency", "safety net"],
        "content": (
            "An emergency fund protects against unexpected job loss, medical emergencies, or urgent vehicle/home repairs. "
            "Recommended amount: 3 to 6 months of mandatory living expenses (rent, food, utilities, EMIs). "
            "Keep emergency funds in highly liquid, capital-safe instruments such as high-yield savings accounts or liquid mutual funds, "
            "never in volatile equities or locked long-term deposits."
        )
    },
    {
        "id": "kb_debt_payoff",
        "title": "Debt Payoff Strategies: Avalanche vs Snowball",
        "category": "Debt",
        "keywords": ["debt", "payoff", "avalanche", "snowball", "credit card interest", "loans"],
        "content": (
            "Two proven strategies to eliminate high-interest liabilities: "
            "1. Debt Avalanche: Pay minimums on all debts, and throw all extra savings at the debt with the highest interest rate (e.g. credit cards at 36-42% APR). Mathematically optimal and saves the most money. "
            "2. Debt Snowball: Pay smallest balance first for psychological momentum and quick behavioral wins. "
            "Always eliminate credit card revolving balances before increasing discretionary investment."
        )
    },
    {
        "id": "kb_savings_rate",
        "title": "Healthy Savings Rate and Wealth Accumulation",
        "category": "Savings",
        "keywords": ["savings rate", "save money", "wealth", "how much to save", "monthly savings"],
        "content": (
            "A personal savings rate is calculated as: (Total Income - Total Expenses) / Total Income * 100. "
            "A benchmark savings rate is 20% to 30%. Saving above 30% significantly accelerates financial freedom. "
            "To increase your savings rate without feeling deprived: automate your savings on payday ('pay yourself first'), "
            "audit monthly recurring subscriptions, and direct 50% of any salary increment straight into investments."
        )
    },
    {
        "id": "kb_lifestyle_inflation",
        "title": "Controlling Lifestyle Inflation",
        "category": "Behavioral Finance",
        "keywords": ["lifestyle creep", "expenses increasing", "spending more", "lifestyle inflation"],
        "content": (
            "Lifestyle creep occurs when discretionary expenditure rises in tandem with salary increases, preventing wealth growth. "
            "Key warning signs include elevated restaurant spending, upgrading electronics unnecessarily, and accumulating unused subscriptions. "
            "Introduce a 48-hour cooling-off rule for non-essential purchases over ₹2,000 to curb impulsive spending."
        )
    },
    {
        "id": "kb_subscription_audit",
        "title": "Recurring Subscription Optimization",
        "category": "Optimization",
        "keywords": ["subscriptions", "recurring", "netflix", "gym", "spotify", "cut costs"],
        "content": (
            "Micro-subscriptions (streaming services, cloud storage, fitness apps) quietly siphon significant monthly capital. "
            "Conduct a quarterly subscription audit: cancel any service not accessed within the previous 30 days, "
            "and switch to annual or family plans where multi-user sharing yields 30-50% discounts."
        )
    }
]

class FinancialRAG:
    @staticmethod
    def retrieve(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant financial guidelines using keyword matching & token overlap scoring.
        """
        tokens = set(re.findall(r'\b[a-z0-9]+\b', query.lower()))
        if not tokens:
            return FINANCIAL_KNOWLEDGE_DOCS[:top_k]

        scored_docs = []
        for doc in FINANCIAL_KNOWLEDGE_DOCS:
            doc_tokens = set(re.findall(r'\b[a-z0-9]+\b', (doc["title"] + " " + " ".join(doc["keywords"]) + " " + doc["content"]).lower()))
            overlap = len(tokens.intersection(doc_tokens))
            keyword_bonus = sum(2 for kw in doc["keywords"] if kw.lower() in query.lower())
            score = overlap + keyword_bonus
            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = [item[1] for item in scored_docs[:top_k]]
        
        # If no specific matches found, return 50/30/20 and savings rate guidelines as baseline
        if not results:
            results = FINANCIAL_KNOWLEDGE_DOCS[:top_k]

        return results

rag_engine = FinancialRAG()
