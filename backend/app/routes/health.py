from datetime import datetime

from flask import Blueprint, current_app, jsonify

from app.models.user import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Backend health check endpoint.
    Used for:
    - deployment monitoring
    - frontend connectivity testing
    - database connection verification
    """

    try:
        # Test database connection
        db.session.execute(db.text("SELECT 1"))

        return jsonify({
            "status": "healthy",
            "service": "events-api",
            "database": "connected",
            "environment": current_app.config.get("ENV", "development"),
            "timestamp": datetime.utcnow().isoformat(),
        }), 200

    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "events-api",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }), 500