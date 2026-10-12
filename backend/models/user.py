from models.db import get_db


def create_user(email, password_hash, created_at, name=None):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO users (email, name, password_hash, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (email, name, password_hash, created_at),
    )
    db.commit()
    return find_user_by_id(cursor.lastrowid)


def find_user_by_email(email):
    row = get_db().execute(
        "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    return dict(row) if row else None


def find_user_by_id(user_id):
    row = get_db().execute(
        "SELECT id, email, name, password_hash, created_at FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    return dict(row) if row else None


def update_user_name(user_id, name):
    db = get_db()
    db.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    db.commit()
    return find_user_by_id(user_id)
