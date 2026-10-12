from models.chat_history import (
    delete_thread_for_user,
    get_thread_for_user,
    list_history_by_user,
    list_threads_by_user,
)
from models.child import get_child_for_user
from services.response_service import success_response


def get_history(user_id, child_id=None, thread_id=None):
    return success_response(get_history_payload(user_id, child_id, thread_id))


def get_history_payload(user_id, child_id=None, thread_id=None):
    if child_id is not None and not get_child_for_user(child_id, user_id):
        raise ValueError("Selected child not found for this user")
    if thread_id is not None and not get_thread_for_user(thread_id, user_id, child_id):
        raise ValueError("Selected thread not found for this child")
    return {
        "history": list_history_by_user(user_id, child_id=child_id, thread_id=thread_id),
        "threads": list_threads_by_user(user_id, child_id=child_id),
        "active_thread_id": thread_id,
    }


def delete_history_thread(user_id, thread_id):
    thread = delete_thread_for_user(thread_id, user_id)
    if not thread:
        raise ValueError("Selected thread not found")
    return success_response({"deleted": True, "thread_id": thread_id})
