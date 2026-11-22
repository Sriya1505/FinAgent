"""
FinAgent Database Module (SQLite with full relational schema)
Handles Users, Transactions, Budgets, Savings_Goals, User_Preferences,
Predictions, and Recommendations.

CLEAN ARCHITECTURE: No hardcoded demo transactions, dummy budgets,
or fake users are pre-seeded into production database.
"""

import sqlite3
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "finagent.db")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA busy_timeout = 30000")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        is_recurring INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 3. Budgets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        spending_limit REAL NOT NULL,
        month TEXT NOT NULL, -- format: YYYY-MM
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(user_id, category, month)
    );
    """)

    # 4. Savings Goals Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS savings_goals (
        goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL NOT NULL DEFAULT 0.0,
        deadline TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 5. User Preferences Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INTEGER PRIMARY KEY,
        spending_style TEXT DEFAULT 'balanced', -- frugal, balanced, ambitious
        priorities TEXT DEFAULT 'savings',
        trust_calibration_style TEXT DEFAULT 'analytical', -- analytical, supportive, strict
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 6. Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        predicted_amount REAL NOT NULL,
        category TEXT DEFAULT 'total',
        month TEXT NOT NULL,
        model_name TEXT DEFAULT 'linear_trend',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 7. Recommendations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recommendation TEXT NOT NULL,
        reason TEXT NOT NULL,
        category TEXT,
        potential_savings REAL DEFAULT 0.0,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 8. Password Resets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS password_resets (
        reset_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        reset_code TEXT NOT NULL,
        expires_at REAL NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 9. Finny Conversations Table (ChatGPT-like threads)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS finny_conversations (
        conversation_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        is_pinned INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # Column migrations if existing table lacks columns
    cursor.execute("PRAGMA table_info(finny_conversations)")
    conv_cols = [c[1] for c in cursor.fetchall()]
    if "is_pinned" not in conv_cols:
        cursor.execute("ALTER TABLE finny_conversations ADD COLUMN is_pinned INTEGER DEFAULT 0")
    if "is_archived" not in conv_cols:
        cursor.execute("ALTER TABLE finny_conversations ADD COLUMN is_archived INTEGER DEFAULT 0")

    # 10. Finny Messages Table (Thread Messages with full markdown & metadata)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS finny_messages (
        message_id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        proof TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES finny_conversations(conversation_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    cursor.execute("PRAGMA table_info(finny_messages)")
    msg_cols = [c[1] for c in cursor.fetchall()]
    if "metadata" not in msg_cols:
        cursor.execute("ALTER TABLE finny_messages ADD COLUMN metadata TEXT")

    # 11. Finny Gamification Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS finny_gamification_profiles (
        user_id INTEGER PRIMARY KEY,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak_days INTEGER DEFAULT 1,
        last_active_date TEXT,
        total_challenges_completed INTEGER DEFAULT 0,
        mystery_boxes_opened INTEGER DEFAULT 0,
        boss_battles_won INTEGER DEFAULT 0,
        daily_spin_last_date TEXT,
        map_node_index INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 12. Finny User Challenges
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS finny_user_challenges (
        enrollment_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        challenge_id TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        difficulty TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        target_type TEXT,
        target_value REAL,
        current_value REAL DEFAULT 0.0,
        start_date TEXT,
        end_date TEXT,
        reward_xp INTEGER DEFAULT 50,
        reward_badge TEXT,
        is_custom INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # 13. Finny User Badges
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS finny_user_badges (
        badge_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        badge_key TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        rarity TEXT NOT NULL,
        icon TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # Create indices for sub-millisecond retrieval
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finny_conv_user ON finny_conversations(user_id, updated_at DESC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finny_msg_conv ON finny_messages(conversation_id, created_at ASC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finny_challenges_user ON finny_user_challenges(user_id, status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_finny_badges_user ON finny_user_badges(user_id, badge_key);")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema initialized cleanly at", DB_PATH)
