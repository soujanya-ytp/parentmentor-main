from flask import jsonify


def success_response(data, status=200):
    return jsonify({"success": True, "data": data, "error": None}), status


def error_response(message, status=400):
    return jsonify({"success": False, "data": None, "error": message}), status
