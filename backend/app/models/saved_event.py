from datetime import datetime

from app.models.user import db


class SavedEvent(db.Model):
    __tablename__ = "saved_events"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # Relationship to user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # External API event ID
    external_event_id = db.Column(
        db.String(100),
        nullable=False
    )

    # Source platform
    source = db.Column(
        db.String(50),
        nullable=False
    )

    # Event details
    event_name = db.Column(
        db.String(255),
        nullable=False
    )

    event_description = db.Column(
        db.Text
    )

    venue_name = db.Column(
        db.String(255)
    )

    venue_address = db.Column(
        db.String(500)
    )

    image_url = db.Column(
        db.String(500)
    )

    event_url = db.Column(
        db.String(500)
    )

    event_date = db.Column(
        db.String(100)
    )

    category = db.Column(
        db.String(100)
    )

    # Reminder system
    reminder_enabled = db.Column(
        db.Boolean,
        default=True
    )

    reminder_sent = db.Column(
        db.Boolean,
        default=False
    )

    reminder_datetime = db.Column(
        db.DateTime,
        nullable=True
    )

    # User notes
    notes = db.Column(
        db.Text,
        nullable=True
    )

    # Timestamps
    saved_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Prevent duplicate saved events
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "external_event_id",
            "source",
            name="unique_saved_event"
        ),
    )

    def belongs_to(self, user):
        """Check whether this saved event belongs to the current user."""
        return user and self.user_id == user.id

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "external_event_id": self.external_event_id,
            "source": self.source,
            "event_name": self.event_name,
            "event_description": self.event_description,
            "venue_name": self.venue_name,
            "venue_address": self.venue_address,
            "image_url": self.image_url,
            "event_url": self.event_url,
            "event_date": self.event_date,
            "category": self.category,

            # Reminder functionality
            "reminder_enabled": self.reminder_enabled,
            "reminder_sent": self.reminder_sent,
            "reminder_datetime": (
                self.reminder_datetime.isoformat()
                if self.reminder_datetime
                else None
            ),

            # Optional user notes
            "notes": self.notes,

            # Timestamps
            "saved_at": (
                self.saved_at.isoformat()
                if self.saved_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }