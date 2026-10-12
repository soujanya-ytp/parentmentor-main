import json

from models.db import get_db


def create_routine_record(
    child_id,
    title,
    routine_type,
    goal,
    time_of_day,
    estimated_duration,
    structure_level,
    items,
    parent_tips,
    child_phrase,
    recurring,
    created_at,
    updated_at,
    archived=False,
):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO routines (
            child_id, title, routine_type, goal, time_of_day, estimated_duration,
            structure_level, items, parent_tips, child_phrase, archived, recurring,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            child_id,
            title,
            routine_type,
            goal,
            time_of_day,
            estimated_duration,
            structure_level,
            json.dumps(items),
            parent_tips,
            child_phrase,
            1 if archived else 0,
            1 if recurring else 0,
            created_at,
            updated_at,
        ),
    )
    db.commit()
    return get_routine_by_id(cursor.lastrowid)


def list_routines_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, title, routine_type, goal, time_of_day, estimated_duration,
               structure_level, items, parent_tips, child_phrase, archived, recurring,
               created_at, updated_at
        FROM routines
        WHERE child_id = ?
        ORDER BY archived ASC, id DESC
        """,
        (child_id,),
    ).fetchall()
    return [_normalize_routine(row) for row in rows]


def get_routine_by_id(routine_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, routine_type, goal, time_of_day, estimated_duration,
               structure_level, items, parent_tips, child_phrase, archived, recurring,
               created_at, updated_at
        FROM routines
        WHERE id = ?
        """,
        (routine_id,),
    ).fetchone()
    return _normalize_routine(row)


def get_routine_for_child(routine_id, child_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, routine_type, goal, time_of_day, estimated_duration,
               structure_level, items, parent_tips, child_phrase, archived, recurring,
               created_at, updated_at
        FROM routines
        WHERE id = ? AND child_id = ?
        """,
        (routine_id, child_id),
    ).fetchone()
    return _normalize_routine(row)


def update_routine_record(routine_id, child_id, payload):
    db = get_db()
    db.execute(
        """
        UPDATE routines
        SET title = ?, routine_type = ?, goal = ?, time_of_day = ?, estimated_duration = ?,
            structure_level = ?, items = ?, parent_tips = ?, child_phrase = ?, archived = ?,
            recurring = ?, updated_at = ?
        WHERE id = ? AND child_id = ?
        """,
        (
            payload["title"],
            payload.get("routine_type"),
            payload.get("goal"),
            payload.get("time_of_day"),
            payload.get("estimated_duration"),
            payload.get("structure_level"),
            json.dumps(payload.get("items") or []),
            payload.get("parent_tips"),
            payload.get("child_phrase"),
            1 if payload.get("archived") else 0,
            1 if payload.get("recurring") else 0,
            payload["updated_at"],
            routine_id,
            child_id,
        ),
    )
    db.commit()
    return get_routine_for_child(routine_id, child_id)


def delete_routine_record(routine_id, child_id):
    db = get_db()
    db.execute("DELETE FROM routines WHERE id = ? AND child_id = ?", (routine_id, child_id))
    db.commit()


def _normalize_routine(row):
    if not row:
        return None
    routine = dict(row)
    routine["items"] = json.loads(routine["items"] or "[]")
    routine["archived"] = bool(routine["archived"])
    routine["recurring"] = bool(routine["recurring"])
    return routine
