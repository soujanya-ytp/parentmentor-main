from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.chat_service import create_chat
from services.response_service import error_response

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat")
@auth_required
def chat():
    payload = request.get_json(silent=True) or {}

    try:
        return create_chat(g.current_user, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@chat_bp.post("/coach/chat")
@auth_required
def coach_chat():
    payload = request.get_json(silent=True) or {}

    try:
        return create_chat(g.current_user, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)
