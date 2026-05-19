from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from app.middleware.auth import admin_required, organizer_required, token_required
from app.models.event import Event, Ticket
from app.models.user import db
from app.services.eventbrite import EventbriteService
from app.services.ticketmaster import TicketmasterService
from app.utils.mapper import map_eventbrite_events
from app.utils.ticketmaster_mapper import map_ticketmaster_events

events_bp = Blueprint("events", __name__)


def parse_datetime(value):
    """Convert ISO datetime string into Python datetime."""
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


@events_bp.route("/events/search", methods=["GET"])
def search_events():
    """
    Search events from:
    1. Local database
    2. Eventbrite organization events
    3. Ticketmaster events

    Supports pagination:
    /events/search?page=1&limit=12
    """
    query = request.args.get("q", "").lower()
    location = request.args.get("location", "")
    source = request.args.get("source", "all")
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(max(int(request.args.get("limit", 12)), 1), 50)

    try:
        all_events = []

        if source in ["all", "local"]:
            local_query = Event.query.filter(Event.status == "approved")

            if query:
                local_query = local_query.filter(
                    db.or_(
                        Event.name.ilike(f"%{query}%"),
                        Event.description.ilike(f"%{query}%"),
                        Event.category.ilike(f"%{query}%"),
                    )
                )

            local_events = local_query.order_by(Event.start_date.asc()).all()

            all_events.extend([
                {**event.to_dict(), "source": "local"}
                for event in local_events
            ])

        if source in ["all", "eventbrite"]:
            try:
                eb_service = EventbriteService()
                eventbrite_result = eb_service.get_organization_events()

                if eventbrite_result and "events" in eventbrite_result:
                    eb_events = map_eventbrite_events(eventbrite_result)

                    if query:
                        eb_events = [
                            event for event in eb_events
                            if query in event.get("name", "").lower()
                            or query in event.get("description", "").lower()
                            or query in event.get("category", "").lower()
                        ]

                    all_events.extend([
                        {**event, "source": "eventbrite"}
                        for event in eb_events
                    ])

            except Exception as e:
                current_app.logger.error(
                    f"Error fetching Eventbrite events: {str(e)}"
                )

        if source in ["all", "ticketmaster"]:
            try:
                tm_service = TicketmasterService()
                ticketmaster_result = tm_service.search_events(
                    query=query,
                    location=location,
                    size=50,
                )

                if ticketmaster_result:
                    tm_events = map_ticketmaster_events(ticketmaster_result)
                    all_events.extend([
                        {**event, "source": "ticketmaster"}
                        for event in tm_events
                    ])

            except Exception as e:
                current_app.logger.error(
                    f"Error fetching Ticketmaster events: {str(e)}"
                )

        total = len(all_events)
        start = (page - 1) * limit
        end = start + limit
        paginated_events = all_events[start:end]

        return jsonify({
            "events": paginated_events,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
            "has_next": end < total,
            "has_previous": page > 1,
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in search_events: {str(e)}")
        return jsonify({
            "error": "Failed to fetch events",
            "details": str(e),
        }), 500


@events_bp.route("/events", methods=["POST"])
@organizer_required
def create_event(current_user):
    """
    Create a local event.

    Organizers and admins can create events.
    New events start as pending unless created by an admin.
    """
    data = request.get_json() or {}

    required_fields = ["name", "start_date", "end_date"]

    if not all(field in data and data[field] for field in required_fields):
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

    event = Event(
        user_id=current_user.id,
        name=data.get("name"),
        description=data.get("description"),
        category=data.get("category"),
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

    db.session.add(event)
    db.session.commit()

    return jsonify({
        "message": (
            "Event created successfully"
            if event.status == "approved"
            else "Event submitted for admin approval"
        ),
        "event": event.to_dict(),
    }), 201


@events_bp.route("/events/<int:event_id>", methods=["PUT", "PATCH"])
@token_required
def update_event(current_user, event_id):
    """Update a local event if the user owns it or is admin."""
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if not event.can_be_managed_by(current_user):
        return jsonify({"error": "You are not allowed to update this event"}), 403

    data = request.get_json() or {}

    editable_fields = [
        "name",
        "description",
        "category",
        "timezone",
        "venue_name",
        "venue_address",
        "online_event",
        "image_url",
        "is_free",
        "currency",
        "capacity",
        "checkout_url",
    ]

    for field in editable_fields:
        if field in data:
            setattr(event, field, data[field])

    if "start_date" in data:
        parsed_start = parse_datetime(data.get("start_date"))
        if not parsed_start:
            return jsonify({"error": "Invalid start_date format"}), 400
        event.start_date = parsed_start

    if "end_date" in data:
        parsed_end = parse_datetime(data.get("end_date"))
        if not parsed_end:
            return jsonify({"error": "Invalid end_date format"}), 400
        event.end_date = parsed_end

    if event.end_date < event.start_date:
        return jsonify({
            "error": "End date cannot be before start date"
        }), 400

    # If a non-admin updates an approved event, send it back for review.
    if current_user.role != "admin":
        event.status = "pending"

    db.session.commit()

    return jsonify({
        "message": "Event updated successfully",
        "event": event.to_dict(),
    }), 200


@events_bp.route("/events/<int:event_id>", methods=["DELETE"])
@token_required
def delete_event(current_user, event_id):
    """Delete a local event if the user owns it or is admin."""
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if not event.can_be_managed_by(current_user):
        return jsonify({"error": "You are not allowed to delete this event"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({
        "message": "Event deleted successfully"
    }), 200


@events_bp.route("/events/<event_id>", methods=["GET"])
def get_event(event_id):
    """Get single event details from local DB, Ticketmaster, or Eventbrite."""
    try:
        event_id_int = int(event_id)
        event = Event.query.get(event_id_int)

        if event:
            return jsonify({**event.to_dict(), "source": "local"}), 200

    except ValueError:
        pass

    try:
        tm_service = TicketmasterService()
        tm_event = tm_service.get_event(event_id)

        if tm_event:
            from app.utils.ticketmaster_mapper import map_ticketmaster_event

            mapped = map_ticketmaster_event(tm_event)
            return jsonify({**mapped, "source": "ticketmaster"}), 200

    except Exception as e:
        current_app.logger.error(
            f"Error fetching from Ticketmaster: {str(e)}"
        )

    try:
        eb_service = EventbriteService()
        eb_event = eb_service.get_event(event_id)

        if eb_event:
            from app.utils.mapper import map_eventbrite_event

            mapped = map_eventbrite_event(eb_event)
            return jsonify({**mapped, "source": "eventbrite"}), 200

    except Exception as e:
        current_app.logger.error(
            f"Error fetching from Eventbrite: {str(e)}"
        )

    return jsonify({"error": "Event not found"}), 404


@events_bp.route("/events/eventbrite/<string:eventbrite_id>", methods=["GET"])
def get_eventbrite_event(eventbrite_id):
    """Get single event details from Eventbrite by Eventbrite ID."""
    try:
        service = EventbriteService()
        result = service.get_event(eventbrite_id)

        if not result:
            return jsonify({"error": "Event not found on Eventbrite"}), 404

        event_data = map_eventbrite_events({"events": [result]})

        if event_data:
            return jsonify({**event_data[0], "source": "eventbrite"}), 200

        return jsonify({"error": "Failed to parse event data"}), 500

    except Exception as e:
        current_app.logger.error(
            f"Error in get_eventbrite_event: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500


@events_bp.route("/events/categories", methods=["GET"])
def get_categories():
    """Get all event categories."""
    try:
        categories = db.session.query(Event.category).distinct().all()

        return jsonify({
            "categories": [category[0] for category in categories if category[0]]
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_categories: {str(e)}")
        return jsonify({"error": str(e)}), 500


@events_bp.route("/admin/events/pending", methods=["GET"])
@admin_required
def get_pending_events(current_user):
    """Admin: view pending events waiting for approval."""
    pending_events = Event.query.filter_by(status="pending").order_by(
        Event.created_at.desc()
    ).all()

    return jsonify({
        "events": [event.to_dict() for event in pending_events],
        "total": len(pending_events),
    }), 200


@events_bp.route("/admin/events/<int:event_id>/approve", methods=["PATCH"])
@admin_required
def approve_event(current_user, event_id):
    """Admin: approve a pending event."""
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    event.status = "approved"
    event.admin_note = None

    db.session.commit()

    return jsonify({
        "message": "Event approved successfully",
        "event": event.to_dict(),
    }), 200


@events_bp.route("/admin/events/<int:event_id>/reject", methods=["PATCH"])
@admin_required
def reject_event(current_user, event_id):
    """Admin: reject a pending event."""
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json() or {}

    event.status = "rejected"
    event.admin_note = data.get("admin_note", "Event rejected by admin")

    db.session.commit()

    return jsonify({
        "message": "Event rejected successfully",
        "event": event.to_dict(),
    }), 200