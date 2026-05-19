from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models.user import User


def token_required(f):
    """Protect routes that require a logged-in user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()

            current_user_id = int(get_jwt_identity())
            current_user = User.query.get(current_user_id)

            if not current_user:
                return jsonify({"error": "User not found"}), 404

            return f(current_user, *args, **kwargs)

        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

    return decorated


def admin_required(f):
    """Protect routes that should only be accessed by admins."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()

            current_user_id = int(get_jwt_identity())
            current_user = User.query.get(current_user_id)

            if not current_user:
                return jsonify({"error": "User not found"}), 404

            if current_user.role != "admin":
                return jsonify({"error": "Admin access required"}), 403

            return f(current_user, *args, **kwargs)

        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

    return decorated


def organizer_required(f):
    """Protect routes that should only be accessed by organizers or admins."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()

            current_user_id = int(get_jwt_identity())
            current_user = User.query.get(current_user_id)

            if not current_user:
                return jsonify({"error": "User not found"}), 404

            if current_user.role not in ["organizer", "admin"]:
                return jsonify({"error": "Organizer access required"}), 403

            return f(current_user, *args, **kwargs)

        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

    return decorated