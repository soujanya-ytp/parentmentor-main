from flask import Blueprint

from services.response_service import success_response

health_bp = Blueprint("health", __name__)


@health_bp.get("/api/ask")
def health_check():
    return success_response({"message": "ParentMentor API is running"})
