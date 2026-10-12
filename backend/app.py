import os

from flask import Flask, jsonify
from flask_cors import CORS

from models.db import close_db, init_db
from routes import register_blueprints
from dotenv import load_dotenv

load_dotenv()
def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    app.config["DATABASE"] = os.path.join(os.path.dirname(__file__), "parentmentor.db")
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    register_blueprints(app)

    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db()

    @app.errorhandler(Exception)
    def handle_exception(exc):
        return jsonify({"success": False, "data": None, "error": str(exc)}), 500

    @app.errorhandler(404)
    def handle_404(exc):
        return jsonify({"success": False, "data": None, "error": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def handle_405(exc):
        return jsonify({"success": False, "data": None, "error": "Method not allowed"}), 405

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
