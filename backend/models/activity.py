from models.db import get_db


def create_activity_record(
    child_id,
    title,
    category,
    description,
    materials,
    duration,
    benefits,
    parent_tip,
    created_at,
):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO activities (
            child_id, title, category, description, materials, duration, benefits, parent_tip, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (child_id, title, category, description, materials, duration, benefits, parent_tip, created_at),
    )
    db.commit()
    return get_activity_by_id(cursor.lastrowid)


def list_activities_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, title, category, description, materials, duration, benefits, parent_tip, created_at
        FROM activities
        WHERE child_id = ?
        ORDER BY id DESC
        """,
        (child_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def get_activity_by_id(activity_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, category, description, materials, duration, benefits, parent_tip, created_at
        FROM activities
        WHERE id = ?
        """,
        (activity_id,),
    ).fetchone()
    return dict(row) if row else None


def delete_activity_record(activity_id, child_id):
    db = get_db()
    db.execute("DELETE FROM activities WHERE id = ? AND child_id = ?", (activity_id, child_id))
    db.commit()
