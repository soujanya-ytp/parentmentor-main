from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.response_service import error_response
from services.task_service import create_task, delete_task, list_tasks, toggle_task, update_task

task_bp = Blueprint("task", __name__)


@task_bp.get("/tasks")
@auth_required
def fetch_tasks():
    child_id = request.args.get("child_id", type=int)

    try:
        return list_tasks(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@task_bp.post("/tasks")
@auth_required
def add_task():
    payload = request.get_json(silent=True) or {}

    try:
        return create_task(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@task_bp.put("/tasks/<int:task_id>")
@auth_required
def edit_task(task_id):
    payload = request.get_json(silent=True) or {}

    try:
        return update_task(g.current_user["id"], task_id, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@task_bp.patch("/tasks/<int:task_id>/toggle")
@auth_required
def toggle_task_route(task_id):
    payload = request.get_json(silent=True) or {}

    try:
        return toggle_task(g.current_user["id"], task_id, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@task_bp.delete("/tasks/<int:task_id>")
@auth_required
def remove_task(task_id):
    child_id = request.args.get("child_id", type=int)

    try:
        return delete_task(g.current_user["id"], task_id, child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)
