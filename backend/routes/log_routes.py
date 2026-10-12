from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.log_service import create_log, get_logs
from services.response_service import error_response

log_bp = Blueprint("log", __name__)


@log_bp.post("/logs")
@auth_required
def add_log():
    payload = request.get_json(silent=True) or {}

    try:
        return create_log(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@log_bp.get("/logs")
@auth_required
def fetch_logs():
    child_id = request.args.get("child_id", type=int)

    try:
        return get_logs(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)
