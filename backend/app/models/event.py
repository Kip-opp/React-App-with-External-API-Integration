from datetime import datetime

from app.models.user import db


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)

    # External provider IDs
    eventbrite_id = db.Column(db.String(50), unique=True, nullable=True)

    # Creator / owner
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Event details
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))

    # Date & time
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    timezone = db.Column(db.String(50), default="Africa/Nairobi")

    # Location
    venue_name = db.Column(db.String(255))
    venue_address = db.Column(db.String(500))
    online_event = db.Column(db.Boolean, default=False)

    # Media
    image_url = db.Column(db.String(500))

    # Pricing
    is_free = db.Column(db.Boolean, default=False)
    currency = db.Column(db.String(10), default="KES")

    # Capacity
    capacity = db.Column(db.Integer, default=100)

    # Moderation / CRUD status
    # pending = waiting for admin approval
    # approved = visible to users
    # rejected = rejected by admin
    # draft = created but not submitted
    # cancelled = no longer active
    status = db.Column(db.String(20), default="pending")

    # Optional admin moderation note
    admin_note = db.Column(db.Text, nullable=True)

    # Eventbrite / checkout URL
    checkout_url = db.Column(db.String(500))

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    tickets = db.relationship(
        "Ticket",
        backref="event",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def is_owned_by(self, user):
        """Check whether the event belongs to the current user."""
        return user and self.user_id == user.id

    def can_be_managed_by(self, user):
        """
        Admins can manage all events.
        Organizers/users can only manage events they created.
        """
        if not user:
            return False

        if getattr(user, "role", None) == "admin":
            return True

        return self.user_id == user.id

    def to_dict(self):
        """Convert event to dictionary for API responses."""
        return {
            "id": self.id,
            "eventbrite_id": self.eventbrite_id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "timezone": self.timezone,
            "venue_name": self.venue_name,
            "venue_address": self.venue_address,
            "online_event": self.online_event,
            "image_url": self.image_url,
            "is_free": self.is_free,
            "currency": self.currency,
            "capacity": self.capacity,
            "status": self.status,
            "admin_note": self.admin_note,
            "checkout_url": self.checkout_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tickets": [ticket.to_dict() for ticket in self.tickets],
        }


class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    eventbrite_ticket_id = db.Column(db.String(50))

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, default=0.0)
    quantity_total = db.Column(db.Integer, default=100)
    quantity_sold = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        quantity_available = max(
            (self.quantity_total or 0) - (self.quantity_sold or 0),
            0,
        )

        return {
            "id": self.id,
            "event_id": self.event_id,
            "eventbrite_ticket_id": self.eventbrite_ticket_id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "quantity_total": self.quantity_total,
            "quantity_sold": self.quantity_sold,
            "quantity_available": quantity_available,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }