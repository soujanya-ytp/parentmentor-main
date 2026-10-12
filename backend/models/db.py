import sqlite3

from flask import current_app, g


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    avatar TEXT,
    interests TEXT,
    favorite_activities TEXT,
    strengths TEXT,
    challenges TEXT,
    goal TEXT,
    notes TEXT,
    mode TEXT NOT NULL DEFAULT 'parent',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    child_id INTEGER NOT NULL,
    thread_id INTEGER,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS chat_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    routine_type TEXT,
    goal TEXT,
    time_of_day TEXT,
    estimated_duration TEXT,
    structure_level TEXT,
    items TEXT,
    parent_tips TEXT,
    child_phrase TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    recurring INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    routine_completed INTEGER NOT NULL DEFAULT 0,
    food_quality TEXT,
    notes TEXT,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'daily',
    completed INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 10,
    due_date TEXT,
    recurring INTEGER NOT NULL DEFAULT 0,
    completion_history TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    materials TEXT,
    duration TEXT,
    benefits TEXT,
    parent_tip TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    mood TEXT NOT NULL,
    notes TEXT,
    trigger TEXT,
    what_helped TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL DEFAULT 0,
    achieved INTEGER NOT NULL DEFAULT 0,
    claimed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    claimed_at TEXT,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TEXT NOT NULL,
    FOREIGN KEY (child_id) REFERENCES children (id)
);

CREATE TABLE IF NOT EXISTS weekly_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    week_start TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (child_id) REFERENCES children (id)
);
"""


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
    return g.db


def init_db():
    db = get_db()
    db.executescript(SCHEMA)
    _migrate_users_name(db)
    _migrate_children_profile_fields(db)
    _migrate_children_mode(db)
    _migrate_chat_threads(db)
    _migrate_routines_table(db)
    db.commit()


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def _migrate_children_mode(db):
    columns = db.execute("PRAGMA table_info(children)").fetchall()
    column_names = {column["name"] for column in columns}
    if "mode" not in column_names:
        db.execute("ALTER TABLE children ADD COLUMN mode TEXT NOT NULL DEFAULT 'parent'")


def _migrate_users_name(db):
    columns = db.execute("PRAGMA table_info(users)").fetchall()
    column_names = {column["name"] for column in columns}
    if "name" not in column_names:
        db.execute("ALTER TABLE users ADD COLUMN name TEXT")


def _migrate_children_profile_fields(db):
    columns = db.execute("PRAGMA table_info(children)").fetchall()
    column_names = {column["name"] for column in columns}
    for statement, column_name in [
        ("ALTER TABLE children ADD COLUMN avatar TEXT", "avatar"),
        ("ALTER TABLE children ADD COLUMN interests TEXT", "interests"),
        ("ALTER TABLE children ADD COLUMN favorite_activities TEXT", "favorite_activities"),
        ("ALTER TABLE children ADD COLUMN strengths TEXT", "strengths"),
        ("ALTER TABLE children ADD COLUMN challenges TEXT", "challenges"),
        ("ALTER TABLE children ADD COLUMN notes TEXT", "notes"),
    ]:
        if column_name not in column_names:
            db.execute(statement)


def _migrate_routines_table(db):
    columns = db.execute("PRAGMA table_info(routines)").fetchall()
    column_names = {column["name"] for column in columns}
    legacy_columns = {"wake_time", "study_time", "play_time", "sleep_time"}

    if columns and legacy_columns.issubset(column_names):
        rows = db.execute(
            """
            SELECT child_id, wake_time, study_time, play_time, sleep_time
            FROM routines
            """
        ).fetchall()
        db.execute("DROP TABLE routines")
        db.executescript(
            """
            CREATE TABLE routines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                child_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                routine_type TEXT,
                goal TEXT,
                time_of_day TEXT,
                estimated_duration TEXT,
                structure_level TEXT,
                items TEXT,
                parent_tips TEXT,
                child_phrase TEXT,
                archived INTEGER NOT NULL DEFAULT 0,
                recurring INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (child_id) REFERENCES children (id)
            );
            """
        )
        for row in rows:
            items = []
            for label, value in [
                ("Wake up", row["wake_time"]),
                ("Study time", row["study_time"]),
                ("Play time", row["play_time"]),
                ("Sleep time", row["sleep_time"]),
            ]:
                if value:
                    items.append(f"{label}: {value}")
            db.execute(
                """
                INSERT INTO routines (
                    child_id, title, routine_type, goal, time_of_day, estimated_duration,
                    structure_level, items, parent_tips, child_phrase, archived, recurring,
                    created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, datetime('now'), datetime('now'))
                """,
                (
                    row["child_id"],
                    "Daily routine",
                    "daily",
                    None,
                    None,
                    None,
                    "balanced",
                    str(items).replace("'", '"'),
                    "Use calm transitions and visible cues between routine steps.",
                    "Let's keep the day moving one step at a time.",
                ),
            )


def _migrate_chat_threads(db):
    columns = db.execute("PRAGMA table_info(chat_history)").fetchall()
    column_names = {column["name"] for column in columns}
    if "thread_id" not in column_names:
        db.execute("ALTER TABLE chat_history ADD COLUMN thread_id INTEGER")

    rows = db.execute(
        """
        SELECT id, user_id, child_id, question, created_at
        FROM chat_history
        WHERE thread_id IS NULL
        ORDER BY id ASC
        """
    ).fetchall()

    for row in rows:
        title = (row["question"] or "Conversation").strip()[:80] or "Conversation"
        cursor = db.execute(
            """
            INSERT INTO chat_threads (user_id, child_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (row["user_id"], row["child_id"], title, row["created_at"], row["created_at"]),
        )
        db.execute(
            "UPDATE chat_history SET thread_id = ? WHERE id = ?",
            (cursor.lastrowid, row["id"]),
        )
