import json

from models.db import get_db


def upsert_weekly_insight(child_id, week_start, summary, created_at):
    db = get_db()
    existing = get_weekly_insight(child_id, week_start)
    payload = json.dumps(summary)

    if existing:
        db.execute(
            """
            UPDATE weekly_insights
            SET summary = ?, created_at = ?
            WHERE child_id = ? AND week_start = ?
            """,
            (payload, created_at, child_id, week_start),
        )
    else:
        db.execute(
            """
            INSERT INTO weekly_insights (child_id, week_start, summary, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (child_id, week_start, payload, created_at),
        )

    db.commit()
    return get_weekly_insight(child_id, week_start)


def get_weekly_insight(child_id, week_start):
    row = get_db().execute(
        """
        SELECT id, child_id, week_start, summary, created_at
        FROM weekly_insights
        WHERE child_id = ? AND week_start = ?
        """,
        (child_id, week_start),
    ).fetchone()
    return _normalize(row)


def _normalize(row):
    if not row:
        return None
    insight = dict(row)
    insight["summary"] = json.loads(insight["summary"] or "{}")
    return insight
