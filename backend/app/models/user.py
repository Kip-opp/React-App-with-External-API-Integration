from datetime import datetime

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(128),
        nullable=False
    )

    # Roles:
    # user = normal platform user
    # organizer = can create/manage own events
    # admin = full platform control
    role = db.Column(
        db.String(20),
        default="user",
        nullable=False
    )

    # Organizer verification
    organizer_verified = db.Column(
        db.Boolean,
        default=False
    )

    # Account status
    is_active = db.Column(
        db.Boolean,
        default=True
    )

    # Dark mode preference
    dark_mode = db.Column(
        db.Boolean,
        default=False
    )

    # Notification preferences
    notifications_enabled = db.Column(
        db.Boolean,
        default=True
    )

    # Profile image
    profile_image = db.Column(
        db.String(500),
        nullable=True
    )

    # Timestamps
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    events = db.relationship(
        "Event",
        backref="creator",
        lazy=True,
        cascade="all, delete-orphan"
    )

    saved_events = db.relationship(
        "SavedEvent",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def set_password(self, password):
        """Hash and store password."""
        self.password_hash = bcrypt.generate_password_hash(
            password
        ).decode("utf-8")

    def check_password(self, password):
        """Validate password against stored hash."""
        return bcrypt.check_password_hash(
            self.password_hash,
            password
        )

    # Role helpers
    @property
    def is_admin(self):
        return self.role == "admin"

    @property
    def is_organizer(self):
        return self.role == "organizer"

    @property
    def is_user(self):
        return self.role == "user"

    def can_manage_event(self, event):
        """
        Admins can manage all events.
        Organizers/users can only manage their own events.
        """
        if self.is_admin:
            return True

        return event.user_id == self.id

    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "organizer_verified": self.organizer_verified,
            "is_active": self.is_active,
            "dark_mode": self.dark_mode,
            "notifications_enabled": self.notifications_enabled,
            "profile_image": self.profile_image,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }