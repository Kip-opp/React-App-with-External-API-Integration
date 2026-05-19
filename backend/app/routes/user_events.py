from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from app.middleware.auth import organizer_required, token_required
from app.models.event import Event, Ticket
from app.models.user import db
from app.services.eventbrite import EventbriteService

user_events_bp = Blueprint("user_events", __name__)


def parse_datetime(value):
    """Convert ISO datetime string into Python datetime."""
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


@user_events_bp.route("/events", methods=["POST"])
@organizer_required
def create_event(current_user):
    """
    Create event in the local database.

    Organizers can create events, but they go into pending status
    until approved by an admin.

    Admin-created events are approved immediately.
    """
    data = request.get_json() or {}

    required = ["name", "start_date", "end_date"]

    if not all(field in data and data[field] for field in required):
        return jsonify({
            "error": "Missing required fields: name, start_date, end_date"
        }), 400

    start_date = parse_datetime(data.get("start_date"))
    end_date = parse_datetime(data.get("end_date"))

    if not start_date or not end_date:
        return jsonify({
            "error": "Invalid start_date or end_date format"
        }), 400

    if end_date < start_date:
        return jsonify({
            "error": "End date cannot be before start date"
        }), 400

    try:
        new_event = Event(
            user_id=current_user.id,
            name=data["name"],
            description=data.get("description", ""),
            category=data.get("category", "Other"),
            start_date=start_date,
            end_date=end_date,
            timezone=data.get("timezone", "Africa/Nairobi"),
            venue_name=data.get("venue_name"),
            venue_address=data.get("venue_address"),
            online_event=data.get("online_event", False),
            image_url=data.get("image_url"),
            is_free=data.get("is_free", False),
            currency=data.get("currency", "KES"),
            capacity=data.get("capacity", 100),
            checkout_url=data.get("checkout_url"),
            status="approved" if current_user.role == "admin" else "pending",
        )

        db.session.add(new_event)
        db.session.flush()

        if "tickets" in data:
            for ticket_data in data["tickets"]:
                ticket = Ticket(
                    event_id=new_event.id,
                    name=ticket_data["name"],
                    description=ticket_data.get("description"),
                    price=float(ticket_data.get("price", 0)),
                    quantity_total=int(ticket_data.get("quantity", 100)),
                )
                db.session.add(ticket)

        # Optional Eventbrite publishing.
        # If Eventbrite fails, the local event still remains pending/approved.
        should_publish_eventbrite = data.get("publish_to_eventbrite", False)

        if should_publish_eventbrite:
            try:
                service = EventbriteService()
                eventbrite_event = service.create_event(data)

                if eventbrite_event:
                    eventbrite_id = eventbrite_event.get("id")
                    new_event.eventbrite_id = eventbrite_id
                    new_event.checkout_url = eventbrite_event.get("url")

                    if "tickets" in data:
                        for ticket_data in data["tickets"]:
                            service.create_ticket_class(eventbrite_id, ticket_data)

                    service.publish_event(eventbrite_id)

            except Exception as eventbrite_error:
                current_app.logger.error(
                    f"Eventbrite publishing failed: {str(eventbrite_error)}"
                )

        db.session.commit()

        return jsonify({
            "message": (
                "Event created successfully"
                if new_event.status == "approved"
                else "Event submitted for admin approval"
            ),
            "event": new_event.to_dict(),
            "eventbrite_url": new_event.checkout_url,
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating event: {str(e)}")
        return jsonify({"error": str(e)}), 500


@user_events_bp.route("/events/my", methods=["GET"])
@token_required
def get_my_events(current_user):
    """
    Get all events created by the current user.

    Supports pagination:
    /events/my?page=1&limit=10
    """
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(max(int(request.args.get("limit", 10)), 1), 50)

    query = Event.query.filter_by(
        user_id=current_user.id
    ).order_by(
        Event.created_at.desc()
    )

    total = query.count()

    events = query.offset(
        (page - 1) * limit
    ).limit(
        limit
    ).all()

    return jsonify({
        "events": [event.to_dict() for event in events],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "has_next": page * limit < total,
        "has_previous": page > 1,
    }), 200


@user_events_bp.route("/events/<int:event_id>", methods=["PUT", "PATCH"])
@token_required
def update_event(current_user, event_id):
    """
    Update an event.

    Admins can update any event.
    Users/organizers can only update their own events.
    Non-admin updates return the event to pending status.
    """
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if not event.can_be_managed_by(current_user):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    editable_fields = [
        "name",
        "description",
        "image_url",
        "category",
        "venue_name",
        "venue_address",
        "online_event",
        "is_free",
        "currency",
        "capacity",
        "checkout_url",
        "timezone",
    ]

    for field in editable_fields:
        if field in data:
            setattr(event, field, data[field])

    if "start_date" in data:
        start_date = parse_datetime(data.get("start_date"))

        if not start_date:
            return jsonify({"error": "Invalid start_date format"}), 400

        event.start_date = start_date

    if "end_date" in data:
        end_date = parse_datetime(data.get("end_date"))

        if not end_date:
            return jsonify({"error": "Invalid end_date format"}), 400

        event.end_date = end_date

    if event.end_date < event.start_date:
        return jsonify({
            "error": "End date cannot be before start date"
        }), 400

    if current_user.role != "admin":
        event.status = "pending"

    event.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "Event updated successfully",
        "event": event.to_dict(),
    }), 200


@user_events_bp.route("/events/<int:event_id>", methods=["DELETE"])
@token_required
def delete_event(current_user, event_id):
    """
    Delete an event.

    Admins can delete any event.
    Users/organizers can only delete their own events.
    """
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if not event.can_be_managed_by(current_user):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({
        "message": "Event deleted successfully"
    }), 200