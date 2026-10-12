from models.db import get_db


def create_reward_record(child_id, title, description, points_required, created_at):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO rewards (
            child_id, title, description, points_required, achieved, claimed, created_at, claimed_at
        )
        VALUES (?, ?, ?, ?, 0, 0, ?, NULL)
        """,
        (child_id, title, description, points_required, created_at),
    )
    db.commit()
    return get_reward_by_id(cursor.lastrowid)


def list_rewards_by_child(child_id):
    rows = get_db().execute(
        """
        SELECT id, child_id, title, description, points_required, achieved, claimed, created_at, claimed_at
        FROM rewards
        WHERE child_id = ?
        ORDER BY claimed ASC, points_required ASC, id DESC
        """,
        (child_id,),
    ).fetchall()
    return [_normalize_reward(row) for row in rows]


def get_reward_by_id(reward_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, description, points_required, achieved, claimed, created_at, claimed_at
        FROM rewards
        WHERE id = ?
        """,
        (reward_id,),
    ).fetchone()
    return _normalize_reward(row)


def get_reward_for_child(reward_id, child_id):
    row = get_db().execute(
        """
        SELECT id, child_id, title, description, points_required, achieved, claimed, created_at, claimed_at
        FROM rewards
        WHERE id = ? AND child_id = ?
        """,
        (reward_id, child_id),
    ).fetchone()
    return _normalize_reward(row)


def update_reward_record(reward_id, child_id, title, description, points_required):
    db = get_db()
    db.execute(
        """
        UPDATE rewards
        SET title = ?, description = ?, points_required = ?
        WHERE id = ? AND child_id = ?
        """,
        (title, description, points_required, reward_id, child_id),
    )
    db.commit()
    return get_reward_for_child(reward_id, child_id)


def set_reward_claim_status(reward_id, child_id, achieved, claimed, claimed_at):
    db = get_db()
    db.execute(
        """
        UPDATE rewards
        SET achieved = ?, claimed = ?, claimed_at = ?
        WHERE id = ? AND child_id = ?
        """,
        (1 if achieved else 0, 1 if claimed else 0, claimed_at, reward_id, child_id),
    )
    db.commit()
    return get_reward_for_child(reward_id, child_id)


def delete_reward_record(reward_id, child_id):
    db = get_db()
    db.execute("DELETE FROM rewards WHERE id = ? AND child_id = ?", (reward_id, child_id))
    db.commit()


def _normalize_reward(row):
    if not row:
        return None
    reward = dict(row)
    reward["achieved"] = bool(reward["achieved"])
    reward["claimed"] = bool(reward["claimed"])
    return reward
