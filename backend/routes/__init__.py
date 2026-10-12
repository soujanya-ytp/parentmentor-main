from routes.activity_routes import activity_bp
from routes.analytics_routes import analytics_bp
from routes.auth_routes import auth_bp
from routes.mood_routes import mood_bp
from routes.reward_routes import reward_bp
from routes.chat_routes import chat_bp
from routes.child_routes import child_bp
from routes.health_routes import health_bp
from routes.history_routes import history_bp
from routes.log_routes import log_bp
from routes.routine_routes import routine_bp
from routes.task_routes import task_bp


def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(child_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(routine_bp)
    app.register_blueprint(log_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(reward_bp)
