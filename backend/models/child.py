from models.db import get_db


def create_child_record(
    user_id,
    name,
    age,
    goal,
    created_at,
    avatar=None,
    interests=None,
    favorite_activities=None,
    strengths=None,
    challenges=None,
    notes=None,
    mode="parent",
):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO children (
            user_id, name, age, avatar, interests, favorite_activities,
            strengths, challenges, goal, notes, mode, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            name,
            age,
            avatar,
            interests,
            favorite_activities,
            strengths,
            challenges,
            goal,
            notes,
            mode or "parent",
            created_at,
        ),
    )
    db.commit()
    return get_child_by_id(cursor.lastrowid)


def list_children_by_user(user_id):
    rows = get_db().execute(
        """
        SELECT id, user_id, name, age, avatar, interests, favorite_activities,
               strengths, challenges, goal, notes, mode, created_at
        FROM children
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def get_child_by_id(child_id):
    row = get_db().execute(
        """
        SELECT id, user_id, name, age, avatar, interests, favorite_activities,
               strengths, challenges, goal, notes, mode, created_at
        FROM children
        WHERE id = ?
        """,
        (child_id,),
    ).fetchone()
    return dict(row) if row else None


def get_child_for_user(child_id, user_id):
    row = get_db().execute(
        """
        SELECT id, user_id, name, age, avatar, interests, favorite_activities,
               strengths, challenges, goal, notes, mode, created_at
        FROM children
        WHERE id = ? AND user_id = ?
        """,
        (child_id, user_id),
    ).fetchone()
    return dict(row) if row else None


def update_child_mode(child_id, user_id, mode):
    db = get_db()
    db.execute(
        """
        UPDATE children
        SET mode = ?
        WHERE id = ? AND user_id = ?
        """,
        (mode, child_id, user_id),
    )
    db.commit()
    return get_child_for_user(child_id, user_id)


def update_child_record(child_id, user_id, payload):
    db = get_db()
    db.execute(
        """
        UPDATE children
        SET name = ?, age = ?, avatar = ?, interests = ?, favorite_activities = ?,
            strengths = ?, challenges = ?, goal = ?, notes = ?, mode = ?
        WHERE id = ? AND user_id = ?
        """,
        (
            payload["name"],
            payload["age"],
            payload.get("avatar"),
            payload.get("interests"),
            payload.get("favorite_activities"),
            payload.get("strengths"),
            payload.get("challenges"),
            payload.get("goal"),
            payload.get("notes"),
            payload.get("mode", "parent"),
            child_id,
            user_id,
        ),
    )
    db.commit()
    return get_child_for_user(child_id, user_id)


def delete_child_record(child_id, user_id):
    db = get_db()
    db.execute("DELETE FROM children WHERE id = ? AND user_id = ?", (child_id, user_id))
    db.commit()
