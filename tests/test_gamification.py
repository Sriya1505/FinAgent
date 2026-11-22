"""
Test suite for FinAgent Gamification 2.0 (Financial Adventure, Quests, Evolution, Boss Battles)
"""

import sys
import os
import unittest
import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from backend.services.gamification_engine import GamificationEngine, LEVELS, FINNY_EVOLUTIONS, CHALLENGE_CATALOG

BASE_URL = "http://127.0.0.1:8000"

class TestGamification2(unittest.TestCase):
    def test_level_calculations(self):
        # 0 XP -> Level 1
        lvl, obj, pct, needed = GamificationEngine.calculate_level_from_xp(0)
        self.assertEqual(lvl, 1)
        self.assertEqual(obj["name"], "Money Beginner")
        self.assertEqual(pct, 0)
        self.assertEqual(needed, 100)

        # 150 XP -> Level 2
        lvl, obj, pct, needed = GamificationEngine.calculate_level_from_xp(150)
        self.assertEqual(lvl, 2)
        self.assertEqual(obj["name"], "Smart Spender")

        # 8000 XP -> Level 8 (Legend)
        lvl, obj, pct, needed = GamificationEngine.calculate_level_from_xp(8000)
        self.assertEqual(lvl, 8)
        self.assertEqual(obj["name"], "Financial Legend")
        self.assertEqual(pct, 100)
        self.assertEqual(needed, 0)
        print("✓ Level calculation tests verified")

    def test_challenge_catalog_completeness(self):
        self.assertEqual(len(CHALLENGE_CATALOG), 3)
        boss = next((c for c in CHALLENGE_CATALOG if c["id"] == "mystery_budget_boss_battle"), None)
        savings = next((c for c in CHALLENGE_CATALOG if c["id"] == "monthly_20_percent_savings"), None)
        no_spend = next((c for c in CHALLENGE_CATALOG if c["id"] == "daily_no_spend_sprint"), None)
        self.assertIsNotNone(boss, "Monthly Boss Battle must be present")
        self.assertIsNotNone(savings, "20% Savings Challenge must be present")
        self.assertIsNotNone(no_spend, "No-Spend Sprint must be present")
        print("✓ Curated challenge catalog verified: Monthly Boss Battle + 2 Unique Strategic Quests")

    def test_evolutions_completeness(self):
        self.assertEqual(len(FINNY_EVOLUTIONS), 8)
        ev_1 = GamificationEngine.get_finny_evolution(1)
        self.assertEqual(ev_1["name"], "Apprentice Finny")
        ev_8 = GamificationEngine.get_finny_evolution(8)
        self.assertEqual(ev_8["name"], "Ascended Financial Legend")
        print("✓ Finny Evolution tiers 1 through 8 verified")

if __name__ == "__main__":
    unittest.main()
