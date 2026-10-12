from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.history_service import delete_history_thread, get_history
from services.response_service import error_response

history_bp = Blueprint("history", __name__)


@history_bp.get("/history")
@auth_required
def history():
    child_id = request.args.get("child_id", type=int)
    thread_id = request.args.get("thread_id", type=int)

    try:
        return get_history(g.current_user["id"], child_id=child_id, thread_id=thread_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@history_bp.delete("/history/<int:thread_id>")
@auth_required
def delete_history(thread_id):
    try:
        return delete_history_thread(g.current_user["id"], thread_id)
    except ValueError as exc:
        return error_response(str(exc), 404)
