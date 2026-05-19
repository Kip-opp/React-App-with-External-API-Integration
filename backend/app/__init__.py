import logging

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config import Config
from app.models.user import bcrypt, db


jwt = JWTManager()


def create_app():
    """Create and configure the Flask application."""

    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Enable CORS for frontend development
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                ],
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS",
                ],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                ],
            }
        },
        supports_credentials=True,
    )

    # Logging
    logging.basicConfig(level=logging.INFO)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            "error": "Token has expired"
        }, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            "error": "Invalid token"
        }, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            "error": "Authorization token required"
        }, 401

    # Create database tables
    with app.app_context():
        db.create_all()

    # Import blueprints
    from app.routes.analytics import analytics_bp
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.health import health_bp
    from app.routes.recommendations import recommendations_bp
    from app.routes.saved_events import saved_events_bp
    from app.routes.user_events import user_events_bp

    # Register blueprints
    app.register_blueprint(
        health_bp
    )

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        events_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        user_events_bp,
        url_prefix="/api/user"
    )

    app.register_blueprint(
        saved_events_bp,
        url_prefix="/api/user"
    )

    app.register_blueprint(
        analytics_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        recommendations_bp,
        url_prefix="/api"
    )

    @app.route("/")
    def home():
        return {
            "message": "EventSphere Backend API Running",
            "status": "healthy"
        }

    return app