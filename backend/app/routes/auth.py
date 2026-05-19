from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.models.user import User, db

auth_bp = Blueprint("auth", __name__)


def get_organizer_code():
    """
    Organizer accounts require a valid organizer code.
    The code should be stored in .env as ORGANIZER_ACCESS_CODE.
    """
    return current_app.config.get("ORGANIZER_ACCESS_CODE", "EVENTSPHERE_ORG_2026")


def create_admin_if_needed():
    """
    Ensures the default admin exists.

    Default admin:
    email: asmien.sam@gmail.com
    password: samaangie@123

    This is only created if no account exists with that email.
    """
    admin_email = current_app.config.get("ADMIN_EMAIL", "asmien.sam@gmail.com")
    admin_password = current_app.config.get("ADMIN_PASSWORD", "samaangie@123")

    existing_admin = User.query.filter_by(email=admin_email).first()

    if existing_admin:
        if existing_admin.role != "admin":
            existing_admin.role = "admin"
            existing_admin.is_active = True
            db.session.commit()

        return existing_admin

    admin = User(
        username="admin",
        email=admin_email,
        role="admin",
        is_active=True,
        organizer_verified=False,
    )
    admin.set_password(admin_password)

    db.session.add(admin)
    db.session.commit()

    return admin


def create_user_token(user):
    """Create JWT access token for a user."""
    return create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "email": user.email,
        },
    )


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new account.

    Supported roles:
    - user: default public signup
    - organizer: requires organizer_code
    - admin: not allowed through public signup
    """
    data = request.get_json() or {}

    required_fields = ["username", "email", "password"]

    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    requested_role = data.get("role", "user").strip().lower()
    organizer_code = data.get("organizer_code")

    if requested_role not in ["user", "organizer"]:
        return jsonify({
            "error": "Invalid role. Public signup only supports user or organizer accounts."
        }), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    role = "user"
    organizer_verified = False

    if requested_role == "organizer":
        if not organizer_code:
            return jsonify({"error": "Organizer access code is required"}), 400

        if organizer_code != get_organizer_code():
            return jsonify({"error": "Invalid organizer access code"}), 403

        role = "organizer"
        organizer_verified = True

    user = User(
        username=username,
        email=email,
        role=role,
        organizer_verified=organizer_verified,
        is_active=True,
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_user_token(user)

    return jsonify({
        "message": "Account created successfully",
        "user": user.to_dict(),
        "access_token": access_token,
        "redirect_view": (
            "organizer-dashboard"
            if user.role == "organizer"
            else "user-dashboard"
        ),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login user, organizer, or admin using the same endpoint."""
    create_admin_if_needed()

    data = request.get_json() or {}

    if not all(field in data and data[field] for field in ["email", "password"]):
        return jsonify({"error": "Missing email or password"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "This account has been disabled"}), 403

    access_token = create_user_token(user)

    if user.role == "admin":
        redirect_view = "admin-dashboard"
    elif user.role == "organizer":
        redirect_view = "organizer-dashboard"
    else:
        redirect_view = "user-dashboard"

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": access_token,
        "redirect_view": redirect_view,
    }), 200


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """Admin-only login endpoint."""
    create_admin_if_needed()

    data = request.get_json() or {}

    if not all(field in data and data[field] for field in ["email", "password"]):
        return jsonify({"error": "Missing email or password"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    if not user.is_active:
        return jsonify({"error": "This admin account has been disabled"}), 403

    access_token = create_user_token(user)

    return jsonify({
        "message": "Admin login successful",
        "user": user.to_dict(),
        "access_token": access_token,
        "redirect_view": "admin-dashboard",
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get the currently logged-in user."""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200