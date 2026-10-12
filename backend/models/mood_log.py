from models.db import get_db


def create_mood_record(child_id, mood, notes, trigger, what_helped, date, created_at):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO mood_logs (child_id, mood, notes, trigger, what_helped, date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (child_id, mood, notes, trigger, what_helped, date, created_at),
    )
    db.commit()
    return get_mood_by_id(cursor.lastrowid)


def list_moods_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, mood, notes, trigger, what_helped, date, created_at
        FROM mood_logs
        WHERE child_id = ?
        ORDER BY date DESC, id DESC
        """,
        (child_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def get_mood_by_id(mood_id):
    row = get_db().execute(
        """
        SELECT id, child_id, mood, notes, trigger, what_helped, date, created_at
        FROM mood_logs
        WHERE id = ?
        """,
        (mood_id,),
    ).fetchone()
    return dict(row) if row else None


def delete_mood_record(mood_id, child_id):
    db = get_db()
    db.execute("DELETE FROM mood_logs WHERE id = ? AND child_id = ?", (mood_id, child_id))
    db.commit()
