import json

from models.db import get_db


def create_task_record(
    child_id,
    title,
    description,
    task_type,
    points,
    due_date,
    recurring,
    created_at,
):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO tasks (
            child_id, title, description, type, completed, streak, points,
            due_date, recurring, completion_history, created_at, updated_at, completed_at
        )
        VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, '[]', ?, ?, NULL)
        """,
        (
            child_id,
            title,
            description,
            task_type,
            points,
            due_date,
            1 if recurring else 0,
            created_at,
            created_at,
        ),
    )
    db.commit()
    return get_task_by_id(cursor.lastrowid)


def list_tasks_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, title, description, type, completed, streak, points,
               due_date, recurring, completion_history, created_at, updated_at, completed_at
        FROM tasks
        WHERE child_id = ?
        ORDER BY completed ASC, due_date IS NULL, due_date ASC, id DESC
        """,
        (child_id,),
    ).fetchall()
    return [_normalize_task(row) for row in rows]


def get_task_by_id(task_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, description, type, completed, streak, points,
               due_date, recurring, completion_history, created_at, updated_at, completed_at
        FROM tasks
        WHERE id = ?
        """,
        (task_id,),
    ).fetchone()
    return _normalize_task(row)


def get_task_for_child(task_id, child_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, description, type, completed, streak, points,
               due_date, recurring, completion_history, created_at, updated_at, completed_at
        FROM tasks
        WHERE id = ? AND child_id = ?
        """,
        (task_id, child_id),
    ).fetchone()
    return _normalize_task(row)


def update_task_record(task_id, child_id, updates):
    db = get_db()
    db.execute(
        """
        UPDATE tasks
        SET title = ?, description = ?, type = ?, points = ?, due_date = ?,
            recurring = ?, updated_at = ?
        WHERE id = ? AND child_id = ?
        """,
        (
            updates["title"],
            updates.get("description"),
            updates.get("task_type") or updates.get("type") or "daily",
            updates["points"],
            updates.get("due_date"),
            1 if updates.get("recurring") else 0,
            updates["updated_at"],
            task_id,
            child_id,
        ),
    )
    db.commit()
    return get_task_for_child(task_id, child_id)


def update_task_completion(task_id, child_id, completed, streak, history, updated_at, completed_at):
    db = get_db()
    db.execute(
        """
        UPDATE tasks
        SET completed = ?, streak = ?, completion_history = ?, updated_at = ?, completed_at = ?
        WHERE id = ? AND child_id = ?
        """,
        (
            1 if completed else 0,
            streak,
            json.dumps(history),
            updated_at,
            completed_at,
            task_id,
            child_id,
        ),
    )
    db.commit()
    return get_task_for_child(task_id, child_id)


def delete_task_record(task_id, child_id):
    db = get_db()
    db.execute("DELETE FROM tasks WHERE id = ? AND child_id = ?", (task_id, child_id))
    db.commit()


def _normalize_task(row):
    if not row:
        return None
    task = dict(row)
    task["completed"] = bool(task["completed"])
    task["recurring"] = bool(task["recurring"])
    task["completion_history"] = json.loads(task["completion_history"] or "[]")
    return task
