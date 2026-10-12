from models.db import get_db


def create_badge_record(child_id, title, description, icon, earned_at):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO badges (child_id, title, description, icon, earned_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (child_id, title, description, icon, earned_at),
    )
    db.commit()
    return get_badge_by_id(cursor.lastrowid)


def list_badges_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, title, description, icon, earned_at
        FROM badges
        WHERE child_id = ?
        ORDER BY id DESC
        """,
        (child_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def get_badge_by_id(badge_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, description, icon, earned_at
        FROM badges
        WHERE id = ?
        """,
        (badge_id,),
    ).fetchone()
    return dict(row) if row else None


def find_badge_by_title(child_id, title):
    row = get_db().execute(
        """
        SELECT id, child_id, title, description, icon, earned_at
        FROM badges
        WHERE child_id = ? AND title = ?
        """,
        (child_id, title),
    ).fetchone()
    return dict(row) if row else None
