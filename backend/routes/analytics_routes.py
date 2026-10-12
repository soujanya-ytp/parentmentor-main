from flask import Blueprint, g, request

from services.analytics_service import get_analytics, get_dashboard, get_insights
from services.auth_service import auth_required
from services.response_service import error_response

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.get("/analytics")
@auth_required
def analytics():
    child_id = request.args.get("child_id", type=int)

    try:
        return get_analytics(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@analytics_bp.get("/dashboard")
@auth_required
def dashboard():
    child_id = request.args.get("child_id", type=int)

    try:
        return get_dashboard(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@analytics_bp.get("/insights")
@auth_required
def insights():
    child_id = request.args.get("child_id", type=int)

    try:
        return get_insights(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)
