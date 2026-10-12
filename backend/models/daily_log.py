from models.db import get_db


def create_daily_log(child_id, date, routine_completed, food_quality, notes):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO daily_logs (child_id, date, routine_completed, food_quality, notes)
        VALUES (?, ?, ?, ?, ?)
        """,
        (child_id, date, 1 if routine_completed else 0, food_quality, notes),
    )
    db.commit()
    return get_log_by_id(cursor.lastrowid)


def get_log_by_id(log_id):
    row = get_db().execute(
        """
        SELECT id, child_id, date, routine_completed, food_quality, notes
        FROM daily_logs
        WHERE id = ?
        """,
        (log_id,),
    ).fetchone()
    return _normalize_row(row)


def list_logs_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, date, routine_completed, food_quality, notes
        FROM daily_logs
        WHERE child_id = ?
        ORDER BY date DESC, id DESC
        """,
        (child_id,),
    ).fetchall()
    return [_normalize_row(row) for row in rows]


def _normalize_row(row):
    if not row:
        return None
    item = dict(row)
    item["routine_completed"] = bool(item["routine_completed"])
    return item
