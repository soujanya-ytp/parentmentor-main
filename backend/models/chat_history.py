import json

from models.db import get_db


def create_thread_record(user_id, child_id, title, created_at, updated_at):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO chat_threads (user_id, child_id, title, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, child_id, title, created_at, updated_at),
    )
    db.commit()
    return get_thread_by_id(cursor.lastrowid)


def get_thread_by_id(thread_id):
    row = get_db().execute(
        """
        SELECT id, user_id, child_id, title, created_at, updated_at
        FROM chat_threads
        WHERE id = ?
        """,
        (thread_id,),
    ).fetchone()
    return dict(row) if row else None


def get_thread_for_user(thread_id, user_id, child_id=None):
    params = [thread_id, user_id]
    query = """
        SELECT id, user_id, child_id, title, created_at, updated_at
        FROM chat_threads
        WHERE id = ? AND user_id = ?
    """
    if child_id is not None:
        query += " AND child_id = ?"
        params.append(child_id)
    row = get_db().execute(query, tuple(params)).fetchone()
    return dict(row) if row else None


def list_threads_by_user(user_id, child_id=None):
    params = [user_id]
    query = """
        SELECT id, user_id, child_id, title, created_at, updated_at
        FROM chat_threads
        WHERE user_id = ?
    """
    if child_id is not None:
        query += " AND child_id = ?"
        params.append(child_id)
    query += " ORDER BY updated_at DESC, id DESC"
    rows = get_db().execute(query, tuple(params)).fetchall()
    return [dict(row) for row in rows]


def touch_thread(thread_id, updated_at):
    db = get_db()
    db.execute(
        "UPDATE chat_threads SET updated_at = ? WHERE id = ?",
        (updated_at, thread_id),
    )
    db.commit()


def create_history_record(user_id, child_id, thread_id, question, response, created_at):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO chat_history (user_id, child_id, thread_id, question, response, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, child_id, thread_id, question, json.dumps(response), created_at),
    )
    db.commit()
    return get_history_by_id(cursor.lastrowid)


def get_history_by_id(history_id):
    row = get_db().execute(
        """
        SELECT id, user_id, child_id, thread_id, question, response, created_at
        FROM chat_history
        WHERE id = ?
        """,
        (history_id,),
    ).fetchone()
    if not row:
        return None
    result = dict(row)
    result["response"] = json.loads(result["response"])
    return result


def list_history_by_user(user_id, child_id=None, thread_id=None):
    db = get_db()
    query = """
        SELECT id, user_id, child_id, thread_id, question, response, created_at
        FROM chat_history
        WHERE user_id = ?
    """
    params = [user_id]
    if child_id is not None:
        query += " AND child_id = ?"
        params.append(child_id)
    if thread_id is not None:
        query += " AND thread_id = ?"
        params.append(thread_id)
    query += " ORDER BY created_at DESC, id DESC"
    rows = db.execute(query, tuple(params)).fetchall()

    history = []
    for row in rows:
        item = dict(row)
        item["response"] = json.loads(item["response"])
        history.append(item)
    return history


def delete_thread_for_user(thread_id, user_id):
    thread = get_thread_for_user(thread_id, user_id)
    if not thread:
        return None

    db = get_db()
    db.execute(
        "DELETE FROM chat_history WHERE thread_id = ? AND user_id = ?",
        (thread_id, user_id),
    )
    db.execute(
        "DELETE FROM chat_threads WHERE id = ? AND user_id = ?",
        (thread_id, user_id),
    )
    db.commit()
    return thread
