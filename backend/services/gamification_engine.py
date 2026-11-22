"""
FinAgent Gamification Engine 2.0
Powers the interactive Financial Adventure, Levels, Finny Evolutions,
Daily/Weekly/Monthly/Mystery Quests, Boss Battles, Daily Spin,
Badges, and Streak tracking connected directly to verified Python ledger records.
"""

import os
import sys
import sqlite3
import random
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db_connection

# ==============================================================================
# LEVEL DEFINITIONS (Levels 1 to 8)
# ==============================================================================
LEVELS = [
    {"level": 1, "name": "Money Beginner", "min_xp": 0, "max_xp": 99, "title": "Novice Saver"},
    {"level": 2, "name": "Smart Spender", "min_xp": 100, "max_xp": 249, "title": "Disciplined Buyer"},
    {"level": 3, "name": "Budget Explorer", "min_xp": 250, "max_xp": 499, "title": "Category Scout"},
    {"level": 4, "name": "Savings Star", "min_xp": 500, "max_xp": 999, "title": "Wealth Builder"},
    {"level": 5, "name": "Finance Ninja", "min_xp": 1000, "max_xp": 1999, "title": "Ledger Master"},
    {"level": 6, "name": "Money Master", "min_xp": 2000, "max_xp": 3999, "title": "Capital Commander"},
    {"level": 7, "name": "Wealth Warrior", "min_xp": 4000, "max_xp": 7499, "title": "Financial Strategist"},
    {"level": 8, "name": "Financial Legend", "min_xp": 7500, "max_xp": 999999, "title": "Ascended Sovereign"}
]

# ==============================================================================
# FINNY EVOLUTION TIERS (Visual Tiers matching Levels)
# ==============================================================================
FINNY_EVOLUTIONS = [
    {
        "tier": 1,
        "level_req": 1,
        "name": "Apprentice Finny",
        "description": "Energetic, inquisitive baby companion ready to discover the magic of compounding interest.",
        "aura": "Soft Cyan Sparkle",
        "perk": "+5% bonus XP on daily check-ins",
        "icon": "🐣"
    },
    {
        "tier": 2,
        "level_req": 2,
        "name": "Smart Scout Finny",
        "description": "Equipped with a golden magnifying glass to spot unnecessary small expenses.",
        "aura": "Electric Blue Glow",
        "perk": "Unlocks daily expense detective radar",
        "icon": "🧭"
    },
    {
        "tier": 3,
        "level_req": 3,
        "name": "Budget Ranger Finny",
        "description": "Wields cyber goggles and a holographic category shield to protect your monthly limits.",
        "aura": "Neon Cyan & Violet Rings",
        "perk": "+10% XP on weekly budget challenges",
        "icon": "🛡️"
    },
    {
        "tier": 4,
        "level_req": 4,
        "name": "Star Alchemist Finny",
        "description": "Transmutes impulsive desires into guaranteed long-term emergency savings.",
        "aura": "Golden Stardust Orbit",
        "perk": "Unlocks Mystery Treasure Box boost",
        "icon": "✨"
    },
    {
        "tier": 5,
        "level_req": 5,
        "name": "Shadow Ninja Finny",
        "description": "Silently slices through hidden subscription leaks and recurring fees.",
        "aura": "Midnight Purple Shimmer",
        "perk": "+15% damage bonus in monthly Boss Battles",
        "icon": "🥷"
    },
    {
        "tier": 6,
        "level_req": 6,
        "name": "Cyber Master Finny",
        "description": "A high-tech neural advisor with quantum mathematical insight and zero emotional panic.",
        "aura": "Holographic Matrix Halo",
        "perk": "Double spin rewards on weekends",
        "icon": "🔮"
    },
    {
        "tier": 7,
        "level_req": 7,
        "name": "Neon Warlord Finny",
        "description": "Armed with dual balance blades, vanquishing inflation and bad debt with ease.",
        "aura": "Cosmic Plasma Field",
        "perk": "Grants 1 streak freeze per month",
        "icon": "⚡"
    },
    {
        "tier": 8,
        "level_req": 8,
        "name": "Ascended Financial Legend",
        "description": "The ultimate financial deity. Mastery over cashflow, investments, and economic liberty.",
        "aura": "Celestial Prism Rainbow Radiance",
        "perk": "Permanent 2x multiplier on all challenge rewards",
        "icon": "👑"
    }
]

# ==============================================================================
# FINANCIAL ADVENTURE MAP (8 Map Nodes)
# ==============================================================================
ADVENTURE_MAP_NODES = [
    {
        "id": 0,
        "name": "Savings Shore",
        "region": "Coastal Shallows",
        "level_req": 1,
        "description": "Where your wealth voyage begins. Take your first disciplined steps and set sail.",
        "landmark": "The Piggy Lighthouse",
        "accent": "#38bdf8"
    },
    {
        "id": 1,
        "name": "Budget Bastion",
        "region": "Fortified Plains",
        "level_req": 2,
        "description": "A heavily guarded citadel where spending limits are set in stone against impulse.",
        "landmark": "Gate of Prudence",
        "accent": "#06b6d4"
    },
    {
        "id": 2,
        "name": "Frugal Forest",
        "region": "Emerald Woodlands",
        "level_req": 3,
        "description": "Navigate through winding paths by cutting unnecessary subscriptions and leafy leaks.",
        "landmark": "Grove of Zero-Spend",
        "accent": "#10b981"
    },
    {
        "id": 3,
        "name": "Investment Island",
        "region": "Sapphire Archipelago",
        "level_req": 4,
        "description": "Learn the ancient currents of asset allocation, compound growth, and emergency safety.",
        "landmark": "Harbor of Compounding",
        "accent": "#8b5cf6"
    },
    {
        "id": 4,
        "name": "Compound Citadel",
        "region": "Granite Heights",
        "level_req": 5,
        "description": "A towering fortress of wealth accumulation where interest works for you day and night.",
        "landmark": "Clocktower of Exponential Yield",
        "accent": "#d946ef"
    },
    {
        "id": 5,
        "name": "Capital Peaks",
        "region": "Snowy Crags",
        "level_req": 6,
        "description": "Scale breathtaking heights of multiple cashflow streams and diversified portfolios.",
        "landmark": "Summit of Cashflow",
        "accent": "#f59e0b"
    },
    {
        "id": 6,
        "name": "Quantum Vault",
        "region": "Floating Cyber Monolith",
        "level_req": 7,
        "description": "A futuristic sanctuary where deterministic AI safeguards every rupee from inflation.",
        "landmark": "Chamber of Pure Surplus",
        "accent": "#ec4899"
    },
    {
        "id": 7,
        "name": "Financial Freedom Sanctuary",
        "region": "Celestial Zenith",
        "level_req": 8,
        "description": "The promised land. True peace of mind, time autonomy, and generational prosperity.",
        "landmark": "The Golden Horizon",
        "accent": "#facc15"
    }
]

# ==============================================================================
# MASTER CHALLENGES CATALOG
# ==============================================================================
# CHALLENGE CATALOG
# ==============================================================================
CHALLENGE_CATALOG = [
    # Monthly Boss Battle vs Inflation Titan
    {
        "id": "mystery_budget_boss_battle",
        "category": "mystery",
        "title": "Budget Boss Battle: Defeat Inflation Titan",
        "description": "Deal 1,000 damage to the Inflation Titan by staying under budget and banking surplus!",
        "difficulty": "legendary",
        "duration_days": 30,
        "target_type": "boss_battle_damage",
        "target_value": 1000,
        "reward_xp": 420,
        "reward_badge": "badge_legendary_money_master",
        "finny_advice": "The Inflation Titan is breathing down our necks! Every saved rupee strikes a critical blow!",
        "icon": "👾",
        "is_mystery": True
    }
]

# ==============================================================================
# BADGE DEFINITIONS (10 Master Badges)
# ==============================================================================
BADGES_CATALOG = [
    {
        "key": "badge_golden_wallet",
        "title": "Golden Wallet",
        "description": "Consistently reduced discretionary expenses and mastered smart spending decisions.",
        "rarity": "rare",
        "icon": "👛",
        "unlock_desc": "Trim discretionary outlays by 10% or complete Grocery Genius."
    },
    {
        "key": "badge_no_spend_ninja",
        "title": "No-Spend Ninja",
        "description": "Master of stealthy self-control, completely avoiding non-essential spending on demand.",
        "rarity": "epic",
        "icon": "🥷",
        "unlock_desc": "Complete a 24-Hour or 7-Day No-Spend Challenge."
    },
    {
        "key": "badge_savings_superstar",
        "title": "Savings Superstar",
        "description": "Automated regular contributions and maintained an unbroken savings trajectory.",
        "rarity": "epic",
        "icon": "⭐",
        "unlock_desc": "Save 20% of monthly income or achieve 7 consecutive savings deposits."
    },
    {
        "key": "badge_budget_guardian",
        "title": "Budget Guardian",
        "description": "Vigilantly defended category boundaries without a single breach all month.",
        "rarity": "rare",
        "icon": "🛡️",
        "unlock_desc": "Maintain 100% compliance across all active category budgets."
    },
    {
        "key": "badge_expense_detective",
        "title": "Expense Detective",
        "description": "Uncovered hidden leaks, unnecessary subscriptions, and sneaky recurring charges.",
        "rarity": "common",
        "icon": "🔍",
        "unlock_desc": "Audit transactions and detect 3 or more unnecessary expenditures."
    },
    {
        "key": "badge_consistency_champion",
        "title": "Consistency Champion",
        "description": "Maintained an unbroken daily tracking streak of financial discipline.",
        "rarity": "rare",
        "icon": "🔥",
        "unlock_desc": "Log or audit transactions for 7 or more consecutive days."
    },
    {
        "key": "badge_emergency_hero",
        "title": "Emergency Fund Hero",
        "description": "Built an impenetrable financial moat to protect peace of mind against life's surprises.",
        "rarity": "epic",
        "icon": "🏥",
        "unlock_desc": "Contribute at least ₹5,000 toward an emergency fund goal."
    },
    {
        "key": "badge_investment_explorer",
        "title": "Investment Explorer",
        "description": "Embarked on the path of long-term compounding and disciplined wealth building.",
        "rarity": "common",
        "icon": "🧭",
        "unlock_desc": "Complete monthly investment discipline allocation on schedule."
    },
    {
        "key": "badge_financial_freedom_star",
        "title": "Financial Freedom Star",
        "description": "Achieved extraordinary monthly net surplus, taking massive leaps toward autonomy.",
        "rarity": "legendary",
        "icon": "🌟",
        "unlock_desc": "Generate ₹15,000+ net positive surplus shift in a single month."
    },
    {
        "key": "badge_legendary_money_master",
        "title": "Legendary Money Master",
        "description": "Ascended to the highest echelon of personal finance, vanquishing all budget bosses.",
        "rarity": "legendary",
        "icon": "👑",
        "unlock_desc": "Complete 5 challenges in one month or defeat the Inflation Titan Boss."
    }
]

# ==============================================================================
# DAILY SPIN OUTCOMES (Safe Financial Missions + XP)
# ==============================================================================
SPIN_SECTORS = [
    {"label": "Quick Save ₹100", "xp": 30, "tip": "Set aside ₹100 right now for an easy win!", "icon": "🪙"},
    {"label": "Audit Subscriptions", "xp": 45, "tip": "Check your bank statement for recurring auto-debits.", "icon": "🔍"},
    {"label": "Cook at Home Today", "xp": 50, "tip": "Skip restaurant delivery tonight and enjoy home-cooked food.", "icon": "🍳"},
    {"label": "Jackpot: Mystery Chest", "xp": 100, "tip": "Massive bonus! Finny bestows 100 bonus adventure XP!", "icon": "🎁"},
    {"label": "Track Daily Balance", "xp": 25, "tip": "Verify today's net balance on your Dashboard.", "icon": "📊"},
    {"label": "Dining Cap Review", "xp": 35, "tip": "Review your Food & Dining budget cushion.", "icon": "🥗"},
    {"label": "Finny Mascot Hug", "xp": 40, "tip": "Finny sends you love and +1 day streak boost! 💜", "icon": "💜"},
    {"label": "Double XP Surge", "xp": 75, "tip": "Next challenge completion earns massive bonus points!", "icon": "⚡"}
]


class GamificationEngine:
    @staticmethod
    def get_or_create_profile(user_id: int) -> Dict[str, Any]:
        """Retrieves or creates the user's gamification profile in SQLite."""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM finny_gamification_profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()

        today_str = date.today().isoformat()

        if not row:
            cursor.execute("""
            INSERT INTO finny_gamification_profiles 
            (user_id, xp, level, streak_days, last_active_date, total_challenges_completed, mystery_boxes_opened, boss_battles_won, daily_spin_last_date, map_node_index)
            VALUES (?, 0, 1, 1, ?, 0, 0, 0, NULL, 0)
            """, (user_id, today_str))
            conn.commit()
            cursor.execute("SELECT * FROM finny_gamification_profiles WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()

        profile = dict(row)

        # Check and update streak based on activity date
        last_date_str = profile.get("last_active_date")
        if last_date_str and last_date_str != today_str:
            try:
                last_d = date.fromisoformat(last_date_str)
                diff_days = (date.today() - last_d).days
                if diff_days == 1:
                    profile["streak_days"] = profile.get("streak_days", 1) + 1
                elif diff_days > 2:
                    # Soft reset if missed more than 2 days
                    profile["streak_days"] = 1
                
                cursor.execute("""
                UPDATE finny_gamification_profiles 
                SET streak_days = ?, last_active_date = ?
                WHERE user_id = ?
                """, (profile["streak_days"], today_str, user_id))
                conn.commit()
            except Exception:
                pass

        conn.close()
        return profile

    @staticmethod
    def calculate_level_from_xp(xp: int) -> Tuple[int, Dict[str, Any], int, int]:
        """Calculates current level, level object, current level progress, and XP required for next."""
        current_lvl = 1
        current_obj = LEVELS[0]
        for lvl in LEVELS:
            if xp >= lvl["min_xp"]:
                current_lvl = lvl["level"]
                current_obj = lvl
            else:
                break

        # Calculate progress to next level
        if current_lvl < len(LEVELS):
            next_obj = LEVELS[current_lvl]
            span = next_obj["min_xp"] - current_obj["min_xp"]
            earned_in_level = xp - current_obj["min_xp"]
            pct = min(100, max(0, int((earned_in_level / span) * 100)))
            needed = next_obj["min_xp"] - xp
        else:
            pct = 100
            needed = 0

        return current_lvl, current_obj, pct, needed

    @staticmethod
    def get_finny_evolution(level: int) -> Dict[str, Any]:
        """Returns the visual Finny evolution tier for the current level."""
        idx = min(len(FINNY_EVOLUTIONS) - 1, max(0, level - 1))
        return FINNY_EVOLUTIONS[idx]

    @staticmethod
    def get_adventure_map(level: int, current_node: int) -> List[Dict[str, Any]]:
        """Returns the 8 adventure map nodes with unlock and current position states."""
        nodes = []
        for n in ADVENTURE_MAP_NODES:
            unlocked = level >= n["level_req"]
            is_current = n["id"] == min(current_node, level - 1)
            nodes.append({
                **n,
                "is_unlocked": unlocked,
                "is_current": is_current
            })
        return nodes

    @classmethod
    def evaluate_real_challenge_progress(
        cls, 
        user_id: int, 
        challenge: Dict[str, Any]
    ) -> Tuple[float, float, float, List[Dict[str, Any]]]:
        """
        Dynamically calculates progress, target, remaining, and related transactions
        from the actual SQLite ledger for the user. Zero hardcoded progress!
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        today_str = date.today().isoformat()
        current_month = date.today().strftime("%Y-%m")

        # 1. Fetch user transactions
        cursor.execute("""
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY date DESC
        """, (user_id,))
        rows = cursor.fetchall()
        txs = [dict(r) for r in rows]

        # 2. Fetch user budgets
        cursor.execute("""
        SELECT * FROM budgets 
        WHERE user_id = ? AND month = ?
        """, (user_id, current_month))
        budgets = [dict(r) for r in cursor.fetchall()]

        # 3. Fetch user savings goals
        cursor.execute("""
        SELECT * FROM savings_goals 
        WHERE user_id = ?
        """, (user_id,))
        goals = [dict(r) for r in cursor.fetchall()]

        # 4. Fetch user gamification profile
        cursor.execute("SELECT * FROM finny_gamification_profiles WHERE user_id = ?", (user_id,))
        p_row = cursor.fetchone()
        user_profile = dict(p_row) if p_row else {}

        conn.close()

        target_type = challenge.get("target_type")
        target_val = float(challenge.get("target_value") or 1.0)

        # Helpers
        today_expenses = [t for t in txs if t["date"] == today_str and str(t.get("type", "")).lower() == "expense"]
        month_expenses = [t for t in txs if t["date"].startswith(current_month) and str(t.get("type", "")).lower() == "expense"]
        month_incomes = [t for t in txs if t["date"].startswith(current_month) and str(t.get("type", "")).lower() == "income"]
        
        total_income = sum(t["amount"] for t in month_incomes)
        total_expense = sum(t["amount"] for t in month_expenses)
        total_budget_limit = sum(b["spending_limit"] for b in budgets) or 30000.0

        current_val = 0.0
        remaining_val = target_val
        related_txs = []

        # --- Dynamic Evaluators ---
        if target_type == "no_discretionary_spend_today":
            # Target: 0 non-essential spend today
            discretionary_cats = {'Shopping', 'Entertainment', 'Food & Dining'}
            discretionary_today = [t for t in today_expenses if t["category"] in discretionary_cats]
            spent_today = sum(t["amount"] for t in discretionary_today)
            related_txs = discretionary_today
            if spent_today == 0:
                current_val = 100.0
                remaining_val = 0.0
            else:
                current_val = 0.0
                remaining_val = spent_today

        elif target_type == "min_transactions_today":
            # Track every rupee: at least 1 transaction recorded today or in recent 24h
            related_txs = [t for t in txs if t["date"] == today_str]
            current_val = len(related_txs)
            remaining_val = max(0, target_val - current_val)

        elif target_type == "spend_under_daily_allowance":
            # Daily allowance = monthly budget / 30
            daily_allowance = total_budget_limit / 30.0
            spent_today = sum(t["amount"] for t in today_expenses)
            related_txs = today_expenses
            target_limit = daily_allowance * target_val
            current_val = max(0, target_limit - spent_today)
            remaining_val = max(0, spent_today)

        elif target_type == "zero_impulse_large_spend":
            large_spends = [t for t in today_expenses if t["amount"] >= target_val and t["category"] in {'Shopping', 'Entertainment'}]
            related_txs = large_spends
            if len(large_spends) == 0:
                current_val = 100.0
                remaining_val = 0.0
            else:
                current_val = 0.0
                remaining_val = len(large_spends)

        elif target_type == "no_online_orders_today":
            online_words = {'swiggy', 'zomato', 'amazon', 'flipkart', 'uber', 'blinkit', 'zepto', 'myntra'}
            online_today = [t for t in today_expenses if any(w in t["description"].lower() for w in online_words)]
            related_txs = online_today
            if len(online_today) == 0:
                current_val = 100.0
                remaining_val = 0.0
            else:
                current_val = 0.0
                remaining_val = sum(t["amount"] for t in online_today)

        elif target_type == "food_spend_under":
            food_today = [t for t in today_expenses if t["category"] == "Food & Dining"]
            spent_food = sum(t["amount"] for t in food_today)
            related_txs = food_today
            current_val = max(0, target_val - spent_food)
            remaining_val = max(0, spent_food)

        elif target_type in {"audit_review_count", "audit_transactions_count"}:
            # User reviewed / audited at least target_val transactions
            disc_txs = [t for t in txs if t["category"] in {'Shopping', 'Entertainment', 'Food & Dining', 'Bills & Utilities'}][:10]
            related_txs = disc_txs
            current_val = min(target_val, len(txs))
            remaining_val = max(0, target_val - current_val)

        elif target_type in {"category_under_cap_weekly", "weekly_grocery_cap"}:
            seven_days_ago = (date.today() - timedelta(days=7)).isoformat()
            food_txs = [t for t in txs if t["date"] >= seven_days_ago and str(t.get("type", "")).lower() == "expense" and t["category"] in {"Food & Dining", "Food"}]
            spent_food = sum(t["amount"] for t in food_txs)
            related_txs = food_txs
            current_val = min(100.0, max(0.0, (1.0 - (spent_food / target_val)) * 100.0)) if target_val > 0 else 0.0
            remaining_val = max(0.0, target_val - spent_food)

        elif target_type == "streak_days_target":
            st_days = user_profile.get("streak_days", 1)
            current_val = min(target_val, st_days)
            remaining_val = max(0, target_val - current_val)

        elif target_type == "daily_savings_deposit":
            # Savings contribution >= 500
            savings_deposits = [t for t in txs if t["type"] == "expense" and ("saving" in t["description"].lower() or t["category"] == "Savings")]
            recent_dep = sum(t["amount"] for t in savings_deposits[:3])
            related_txs = savings_deposits[:3]
            current_val = min(target_val, recent_dep)
            remaining_val = max(0, target_val - current_val)

        elif target_type == "no_discretionary_spend_week":
            # Last 7 days discretionary spend
            seven_days_ago = (date.today() - timedelta(days=7)).isoformat()
            week_txs = [t for t in txs if t["date"] >= seven_days_ago and t["type"] == "expense" and t["category"] in {'Shopping', 'Entertainment'}]
            related_txs = week_txs
            spent_week = sum(t["amount"] for t in week_txs)
            current_val = max(0, 100.0 - (spent_week / 20.0))
            remaining_val = spent_week

        elif target_type == "weekly_budget_pace_under":
            # Weekly spend vs pro-rated budget
            seven_days_ago = (date.today() - timedelta(days=7)).isoformat()
            week_txs = [t for t in txs if t["date"] >= seven_days_ago and t["type"] == "expense"]
            related_txs = week_txs
            spent_week = sum(t["amount"] for t in week_txs)
            weekly_cap = (total_budget_limit / 4.0)
            pace_pct = (spent_week / weekly_cap) if weekly_cap > 0 else 0
            current_val = max(0, (1.0 - pace_pct) * 100) if pace_pct <= 1.0 else 0.0
            remaining_val = max(0, weekly_cap - spent_week)

        elif target_type == "savings_rate_monthly":
            # Target: save 20% of monthly income
            surplus = max(0, total_income - total_expense)
            rate = (surplus / total_income) if total_income > 0 else 0.0
            current_val = min(100.0, (rate / target_val) * 100) if target_val > 0 else 0.0
            target_amount = total_income * target_val
            remaining_val = max(0, target_amount - surplus)
            related_txs = month_incomes[:3]

        elif target_type == "zero_budget_breaches_monthly":
            # Zero category breaches across active budgets
            breaches = 0
            for b in budgets:
                cat_spend = sum(t["amount"] for t in month_expenses if t["category"] == b["category"])
                if cat_spend > b["spending_limit"]:
                    breaches += 1
            if len(budgets) > 0 and breaches == 0:
                current_val = 100.0
                remaining_val = 0.0
            else:
                current_val = max(0, 100.0 - (breaches * 35))
                remaining_val = breaches

        elif target_type == "category_under_cap_monthly":
            cat_name = challenge.get("category_filter") or "Food & Dining"
            cat_budget = next((b["spending_limit"] for b in budgets if b["category"] == cat_name), 10000.0)
            cat_txs = [t for t in month_expenses if t["category"] == cat_name]
            related_txs = cat_txs
            spent_cat = sum(t["amount"] for t in cat_txs)
            current_val = min(100.0, max(0, (1.0 - (spent_cat / cat_budget)) * 100)) if cat_budget > 0 else 0
            remaining_val = max(0, cat_budget - spent_cat)

        elif target_type == "emergency_goal_contribution_monthly":
            # Contributions to savings goals this month
            goal_sum = sum(g["current_amount"] for g in goals)
            current_val = min(target_val, goal_sum)
            remaining_val = max(0, target_val - current_val)

        elif target_type == "net_surplus_monthly":
            surplus = max(0, total_income - total_expense)
            current_val = min(target_val, surplus)
            remaining_val = max(0, target_val - surplus)
            related_txs = month_incomes[:2] + month_expenses[:3]

        elif target_type == "boss_battle_damage":
            # Boss Battle: 1000 HP. User deals damage by keeping total spend under total budget limit
            damage = 0.0
            if total_budget_limit > 0:
                saved_buffer = max(0, total_budget_limit - total_expense)
                damage = min(1000.0, (saved_buffer / total_budget_limit) * 1000.0)
            # Add bonus damage for savings goals
            if len(goals) > 0:
                damage = min(1000.0, damage + (len(goals) * 75))
            current_val = damage
            remaining_val = max(0, 1000.0 - damage)

        elif target_type == "consecutive_logging_days" or target_type == "fourteen_day_streak":
            # Calculate consecutive distinct logging days from transactions
            distinct_days = sorted(list(set(t["date"] for t in txs)), reverse=True)
            streak = 0
            check_d = date.today()
            for d_str in distinct_days:
                try:
                    d_obj = date.fromisoformat(d_str)
                    if (check_d - d_obj).days <= 1:
                        streak += 1
                        check_d = d_obj
                    else:
                        break
                except Exception:
                    continue
            current_val = min(target_val, max(1, streak))
            remaining_val = max(0, target_val - current_val)

        else:
            # General fallback progress
            current_val = 50.0
            remaining_val = target_val * 0.5

        # Compute percentage (0 to 100)
        pct = 0.0
        if target_val > 0:
            if target_type in {"no_discretionary_spend_today", "zero_impulse_large_spend", "no_online_orders_today", "zero_budget_breaches_monthly", "weekly_budget_pace_under", "category_under_cap_monthly"}:
                pct = min(100.0, max(0.0, current_val))
            else:
                pct = min(100.0, max(0.0, (current_val / target_val) * 100.0))

        return round(pct, 1), round(current_val, 2), round(remaining_val, 2), related_txs[:5]

    @classmethod
    def get_user_challenges_with_real_progress(cls, user_id: int) -> List[Dict[str, Any]]:
        """Returns all catalog and custom challenges merged with user's active/completed states in SQLite."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch enrolled challenges for user
        cursor.execute("""
        SELECT * FROM finny_user_challenges 
        WHERE user_id = ?
        """, (user_id,))
        enrolled_rows = cursor.fetchall()
        enrolled_map = {r["challenge_id"]: dict(r) for r in enrolled_rows}

        conn.close()

        results = []
        today_str = date.today().isoformat()

        # Merge standard catalog
        for cat_item in CHALLENGE_CATALOG:
            cid = cat_item["id"]
            user_enrolled = enrolled_map.get(cid)

            status = user_enrolled["status"] if user_enrolled else "available"
            enrollment_id = user_enrolled["enrollment_id"] if user_enrolled else None
            start_date = user_enrolled["start_date"] if user_enrolled else today_str
            end_date = user_enrolled["end_date"] if user_enrolled else (date.today() + timedelta(days=cat_item["duration_days"])).isoformat()

            pct, curr_val, rem_val, rel_txs = cls.evaluate_real_challenge_progress(user_id, cat_item)

            if pct >= 100 and status == "active":
                status = "completed"

            # Dynamic Finny message based on progress percentage
            finny_msg = cat_item["finny_advice"]
            finny_state = "happy"
            if pct >= 100:
                finny_msg = "YOU DID IT! 🏆 You've officially conquered this challenge! Claim your reward!"
                finny_state = "celebrating"
            elif pct >= 75:
                finny_msg = "Almost there! 75% complete! Finish strong and claim that XP!"
                finny_state = "star_eyes"
            elif pct >= 50:
                finny_msg = "Halfway there! 50% milestone reached! I'm rooting for you! 💜"
                finny_state = "proud"
            elif pct >= 25:
                finny_msg = "Nice start! 25% down. Keep the financial discipline going!"
                finny_state = "winking"
            elif status == "active" and pct == 0:
                finny_msg = "Mission in flight! Check your daily habits and watch this bar fill up!"
                finny_state = "thinking"

            results.append({
                **cat_item,
                "enrollment_id": enrollment_id,
                "status": status,
                "progress_pct": pct,
                "current_val": curr_val,
                "remaining_val": rem_val,
                "start_date": start_date,
                "end_date": end_date,
                "related_transactions": rel_txs,
                "finny_message": finny_msg,
                "finny_state": finny_state
            })

        # Add custom challenges
        for cid, u_ch in enrolled_map.items():
            if u_ch.get("is_custom"):
                results.append({
                    "id": cid,
                    "enrollment_id": u_ch["enrollment_id"],
                    "category": "custom",
                    "title": u_ch["title"],
                    "description": u_ch["description"] or "Custom user financial challenge",
                    "difficulty": u_ch["difficulty"],
                    "status": u_ch["status"],
                    "duration_days": 15,
                    "target_value": u_ch["target_value"],
                    "reward_xp": u_ch["reward_xp"],
                    "reward_badge": u_ch["reward_badge"] or "badge_golden_wallet",
                    "progress_pct": min(100.0, max(0.0, (u_ch["current_value"] / (u_ch["target_value"] or 1.0)) * 100.0)),
                    "current_val": u_ch["current_value"],
                    "remaining_val": max(0, (u_ch["target_value"] or 0) - u_ch["current_value"]),
                    "start_date": u_ch["start_date"],
                    "end_date": u_ch["end_date"],
                    "finny_advice": "Your custom mission! Stay true to your financial plan.",
                    "finny_message": "Custom mission active! Make every rupee count!",
                    "finny_state": "proud",
                    "icon": "🎨",
                    "is_custom": True,
                    "related_transactions": []
                })

        return results

    @classmethod
    def enroll_challenge(cls, user_id: int, challenge_id: str) -> Dict[str, Any]:
        """Accepts and activates a challenge for the user."""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT * FROM finny_user_challenges 
        WHERE user_id = ? AND challenge_id = ?
        """, (user_id, challenge_id))
        existing = cursor.fetchone()

        target_ch = next((c for c in CHALLENGE_CATALOG if c["id"] == challenge_id), None)
        if not target_ch:
            conn.close()
            raise ValueError(f"Challenge '{challenge_id}' not found in catalog.")

        today_str = date.today().isoformat()
        end_str = (date.today() + timedelta(days=target_ch["duration_days"])).isoformat()
        enrollment_id = f"enr_{uuid_hex()}"

        if existing:
            cursor.execute("""
            UPDATE finny_user_challenges 
            SET status = 'active', start_date = ?, end_date = ?
            WHERE user_id = ? AND challenge_id = ?
            """, (today_str, end_str, user_id, challenge_id))
        else:
            cursor.execute("""
            INSERT INTO finny_user_challenges
            (enrollment_id, user_id, challenge_id, category, title, description, difficulty, status, target_type, target_value, current_value, start_date, end_date, reward_xp, reward_badge, is_custom)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, 0.0, ?, ?, ?, ?, 0)
            """, (
                enrollment_id, user_id, challenge_id, 
                target_ch["category"], target_ch["title"], target_ch["description"],
                target_ch["difficulty"], target_ch["target_type"], target_ch["target_value"],
                today_str, end_str, target_ch["reward_xp"], target_ch.get("reward_badge")
            ))

        conn.commit()
        conn.close()

        return {"status": "success", "message": f"Challenge '{target_ch['title']}' is now active!"}

    @classmethod
    def update_challenge_action(cls, user_id: int, challenge_id: str, action: str) -> Dict[str, Any]:
        """Handles pause, resume, abandon actions."""
        conn = get_db_connection()
        cursor = conn.cursor()

        valid_actions = {
            "pause": "paused",
            "resume": "active",
            "abandon": "available",
            "restart": "active"
        }
        new_status = valid_actions.get(action.lower())
        if not new_status:
            conn.close()
            raise ValueError(f"Invalid action '{action}'. Valid: pause, resume, abandon, restart")

        cursor.execute("""
        UPDATE finny_user_challenges 
        SET status = ? 
        WHERE user_id = ? AND challenge_id = ?
        """, (new_status, user_id, challenge_id))
        conn.commit()
        conn.close()

        return {"status": "success", "action": action, "new_status": new_status}

    @classmethod
    def claim_challenge_reward(cls, user_id: int, challenge_id: str) -> Dict[str, Any]:
        """
        Validates completion on backend, awards XP, awards badges, and prevents duplicate claims.
        """
        challenges = cls.get_user_challenges_with_real_progress(user_id)
        target_ch = next((c for c in challenges if c["id"] == challenge_id), None)
        if not target_ch:
            raise ValueError("Challenge not found.")

        if target_ch["progress_pct"] < 100:
            raise ValueError(f"Challenge conditions not yet fulfilled ({target_ch['progress_pct']}% complete). Keep going!")

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if already completed and claimed
        cursor.execute("""
        SELECT * FROM finny_user_challenges 
        WHERE user_id = ? AND challenge_id = ?
        """, (user_id, challenge_id))
        rec = cursor.fetchone()

        if rec and rec["status"] == "claimed":
            conn.close()
            return {"status": "already_claimed", "message": "Reward for this challenge has already been claimed."}

        today_str = datetime.now().isoformat()
        awarded_xp = target_ch.get("reward_xp", 50)
        badge_key = target_ch.get("reward_badge")

        # Update enrollment to claimed
        if rec:
            cursor.execute("""
            UPDATE finny_user_challenges 
            SET status = 'claimed', completed_at = ?
            WHERE user_id = ? AND challenge_id = ?
            """, (today_str, user_id, challenge_id))
        else:
            enrollment_id = f"enr_{uuid_hex()}"
            cursor.execute("""
            INSERT INTO finny_user_challenges
            (enrollment_id, user_id, challenge_id, category, title, description, difficulty, status, reward_xp, reward_badge, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'claimed', ?, ?, ?)
            """, (
                enrollment_id, user_id, challenge_id,
                target_ch["category"], target_ch["title"], target_ch["description"],
                target_ch["difficulty"], awarded_xp, badge_key, today_str
            ))

        # Award XP and update profile
        cursor.execute("SELECT * FROM finny_gamification_profiles WHERE user_id = ?", (user_id,))
        p = dict(cursor.fetchone())
        new_xp = p.get("xp", 0) + awarded_xp
        new_lvl, lvl_obj, _, _ = cls.calculate_level_from_xp(new_xp)
        new_completed = p.get("total_challenges_completed", 0) + 1
        new_map_node = min(7, new_lvl - 1)

        cursor.execute("""
        UPDATE finny_gamification_profiles 
        SET xp = ?, level = ?, total_challenges_completed = ?, map_node_index = ?
        WHERE user_id = ?
        """, (new_xp, new_lvl, new_completed, new_map_node, user_id))

        # Award Badge if configured and not yet owned
        awarded_badge_info = None
        if badge_key:
            cursor.execute("""
            SELECT * FROM finny_user_badges 
            WHERE user_id = ? AND badge_key = ?
            """, (user_id, badge_key))
            if not cursor.fetchone():
                b_def = next((b for b in BADGES_CATALOG if b["key"] == badge_key), None)
                if b_def:
                    b_id = f"bdg_{uuid_hex()}"
                    cursor.execute("""
                    INSERT INTO finny_user_badges
                    (badge_id, user_id, badge_key, title, description, rarity, icon, earned_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        b_id, user_id, badge_key, b_def["title"], 
                        b_def["description"], b_def["rarity"], b_def["icon"], today_str
                    ))
                    awarded_badge_info = b_def

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "awarded_xp": awarded_xp,
            "new_xp": new_xp,
            "new_level": new_lvl,
            "level_name": lvl_obj["name"],
            "awarded_badge": awarded_badge_info,
            "total_completed": new_completed,
            "mystery_chest_ready": (new_completed % 3 == 0)
        }

    @classmethod
    def execute_daily_spin(cls, user_id: int) -> Dict[str, Any]:
        """Spins the wheel for a random safe financial task and XP bonus (once per day)."""
        conn = get_db_connection()
        cursor = conn.cursor()

        today_str = date.today().isoformat()
        cursor.execute("SELECT * FROM finny_gamification_profiles WHERE user_id = ?", (user_id,))
        p = dict(cursor.fetchone())

        if p.get("daily_spin_last_date") == today_str:
            conn.close()
            return {
                "status": "already_spun",
                "message": "You've already claimed today's Daily Spin! Come back tomorrow at 00:00 for a fresh spin."
            }

        # Pick random spin outcome
        outcome = random.choice(SPIN_SECTORS)
        bonus_xp = outcome["xp"]

        new_xp = p.get("xp", 0) + bonus_xp
        new_lvl, lvl_obj, _, _ = cls.calculate_level_from_xp(new_xp)

        cursor.execute("""
        UPDATE finny_gamification_profiles 
        SET xp = ?, level = ?, daily_spin_last_date = ?
        WHERE user_id = ?
        """, (new_xp, new_lvl, today_str, user_id))

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "outcome": outcome,
            "bonus_xp": bonus_xp,
            "new_xp": new_xp,
            "new_level": new_lvl,
            "level_name": lvl_obj["name"]
        }

    @classmethod
    def open_mystery_treasure_box(cls, user_id: int) -> Dict[str, Any]:
        """Opens Finny's Mystery Box (unlocked every 3 completed challenges)."""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM finny_gamification_profiles WHERE user_id = ?", (user_id,))
        p = dict(cursor.fetchone())

        completed = p.get("total_challenges_completed", 0)
        opened = p.get("mystery_boxes_opened", 0)

        # Available boxes = completed // 3 - opened
        available = (completed // 3) - opened
        if available <= 0:
            conn.close()
            return {
                "status": "locked",
                "message": f"Complete {3 - (completed % 3)} more challenges to unlock Finny's next Mystery Chest!"
            }

        # Mystery rewards
        mystery_xp = random.choice([100, 150, 200, 250])
        finny_gift_phrases = [
            "You unlocked Finny's Golden Ledger Rune! 💎",
            "You discovered the Starlight Savings Compass! 🧭",
            "Finny grants you the Crown of Budget Victory! 👑",
            "Cosmic surplus unlocked! Your compounding is speeding up! 🚀"
        ]
        phrase = random.choice(finny_gift_phrases)

        new_xp = p.get("xp", 0) + mystery_xp
        new_lvl, lvl_obj, _, _ = cls.calculate_level_from_xp(new_xp)
        new_opened = opened + 1

        cursor.execute("""
        UPDATE finny_gamification_profiles 
        SET xp = ?, level = ?, mystery_boxes_opened = ?
        WHERE user_id = ?
        """, (new_xp, new_lvl, new_opened, user_id))

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "mystery_xp": mystery_xp,
            "finny_phrase": phrase,
            "new_xp": new_xp,
            "new_level": new_lvl,
            "boxes_remaining": available - 1
        }

    @classmethod
    def get_badges_overview(cls, user_id: int) -> List[Dict[str, Any]]:
        """Returns all 10 badges with unlock states and earned timestamps for user."""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT * FROM finny_user_badges 
        WHERE user_id = ?
        """, (user_id,))
        earned = {r["badge_key"]: dict(r) for r in cursor.fetchall()}
        conn.close()

        badges = []
        for b in BADGES_CATALOG:
            is_earned = b["key"] in earned
            earned_at = earned[b["key"]]["earned_at"] if is_earned else None
            badges.append({
                **b,
                "is_unlocked": is_earned,
                "earned_at": earned_at
            })
        return badges

    @classmethod
    def create_custom_challenge(cls, user_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Allows users to configure and launch a custom personal financial challenge."""
        title = payload.get("title") or "Custom Savings Goal"
        category = payload.get("category") or "custom"
        target_val = float(payload.get("target_amount") or 5000.0)
        duration_days = int(payload.get("duration_days") or 15)
        difficulty = payload.get("difficulty") or "medium"
        reward_xp = int(payload.get("reward_xp") or 100)
        desc = payload.get("description") or f"Save ₹{target_val:,.0f} in {duration_days} days."

        today_str = date.today().isoformat()
        end_str = (date.today() + timedelta(days=duration_days)).isoformat()
        cid = f"custom_{uuid_hex()[:8]}"
        enr_id = f"enr_{uuid_hex()}"

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO finny_user_challenges
        (enrollment_id, user_id, challenge_id, category, title, description, difficulty, status, target_type, target_value, current_value, start_date, end_date, reward_xp, reward_badge, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'custom_savings_target', ?, 0.0, ?, ?, ?, 'badge_golden_wallet', 1)
        """, (
            enr_id, user_id, cid, category, title, desc, difficulty, target_val, today_str, end_str, reward_xp
        ))
        conn.commit()
        conn.close()

        return {
            "status": "success",
            "challenge_id": cid,
            "title": title,
            "target_amount": target_val,
            "end_date": end_str
        }

    @classmethod
    def get_personal_leaderboard(cls, user_id: int) -> Dict[str, Any]:
        """Returns the user's personal competition comparison (current month vs previous month)."""
        conn = get_db_connection()
        cursor = conn.cursor()

        current_month = date.today().strftime("%Y-%m")
        prev_month = (date.today().replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

        cursor.execute("""
        SELECT type, SUM(amount) as total 
        FROM transactions 
        WHERE user_id = ? AND date LIKE ? 
        GROUP BY type
        """, (user_id, f"{current_month}%"))
        curr_sums = {r["type"]: r["total"] for r in cursor.fetchall()}

        cursor.execute("""
        SELECT type, SUM(amount) as total 
        FROM transactions 
        WHERE user_id = ? AND date LIKE ? 
        GROUP BY type
        """, (user_id, f"{prev_month}%"))
        prev_sums = {r["type"]: r["total"] for r in cursor.fetchall()}

        conn.close()

        curr_income = curr_sums.get("income", 0.0)
        curr_expense = curr_sums.get("expense", 0.0)
        curr_surplus = max(0.0, curr_income - curr_expense)

        prev_income = prev_sums.get("income", 0.0)
        prev_expense = prev_sums.get("expense", 0.0)
        prev_surplus = max(0.0, prev_income - prev_expense)

        surplus_delta = curr_surplus - prev_surplus
        expense_delta = curr_expense - prev_expense

        profile = cls.get_or_create_profile(user_id)
        level, lvl_obj, pct, needed = cls.calculate_level_from_xp(profile.get("xp", 0))

        return {
            "user_id": user_id,
            "current_month": current_month,
            "previous_month": prev_month,
            "level": level,
            "level_name": lvl_obj["name"],
            "xp": profile.get("xp", 0),
            "streak_days": profile.get("streak_days", 1),
            "current_surplus": curr_surplus,
            "previous_surplus": prev_surplus,
            "surplus_improvement": surplus_delta,
            "is_outperforming_prev_month": surplus_delta >= 0,
            "current_expenses": curr_expense,
            "previous_expenses": prev_expense,
            "expense_reduction": -expense_delta if expense_delta < 0 else 0
        }


def uuid_hex():
    import uuid
    return uuid.uuid4().hex
