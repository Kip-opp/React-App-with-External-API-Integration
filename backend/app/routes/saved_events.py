from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.schemas.saved_event import SavedEventSchema
from app.services.saved_event import SavedEventService

saved_events_bp = Blueprint(
    "saved_events",
    __name__
)

saved_event_schema = SavedEventSchema()

saved_events_schema = SavedEventSchema(
    many=True
)


@saved_events_bp.route(
    "/saved-events",
    methods=["GET"]
)
@jwt_required()
def get_saved_events():
    """
    Get all saved events for the logged-in user.

    Supports pagination:
    /saved-events?page=1&limit=10
    """
    user_id = int(get_jwt_identity())

    page = max(int(request.args.get("page", 1)), 1)
    limit = min(max(int(request.args.get("limit", 10)), 1), 50)

    events = SavedEventService.get_saved_events(user_id)

    total = len(events)

    start = (page - 1) * limit
    end = start + limit

    paginated_events = events[start:end]

    return jsonify({
        "saved_events": saved_events_schema.dump(
            paginated_events
        ),
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (
            (total + limit - 1) // limit
        ),
        "has_next": end < total,
        "has_previous": page > 1,
    }), 200


@saved_events_bp.route(
    "/saved-events",
    methods=["POST"]
)
@jwt_required()
def save_event():
    """
    Save an event for the logged-in user.
    """
    user_id = int(get_jwt_identity())

    data = request.get_json() or {}

    errors = saved_event_schema.validate(data)

    if errors:
        return jsonify({
            "errors": errors
        }), 400

    # Optional reminder datetime
    reminder_datetime = data.get(
        "reminder_datetime"
    )

    if reminder_datetime:
        try:
            reminder_datetime = datetime.fromisoformat(
                reminder_datetime.replace(
                    "Z",
                    "+00:00"
                )
            )
        except Exception:
            return jsonify({
                "error":
                    "Invalid reminder_datetime format"
            }), 400

        data["reminder_datetime"] = (
            reminder_datetime
        )

    saved_event, error = (
        SavedEventService.save_event(
            user_id,
            data
        )
    )

    if error:
        return jsonify({
            "error": error
        }), 409

    return jsonify({
        "message":
            "Event saved successfully",

        "saved_event":
            saved_event_schema.dump(
                saved_event
            )
    }), 201


@saved_events_bp.route(
    "/saved-events/<int:saved_event_id>",
    methods=["PATCH"]
)
@jwt_required()
def update_saved_event(
    saved_event_id
):
    """
    Update reminder settings
    or notes for a saved event.
    """
    user_id = int(get_jwt_identity())

    data = request.get_json() or {}

    updated_event, error = (
        SavedEventService
        .update_saved_event(
            user_id=user_id,
            saved_event_id=saved_event_id,
            data=data
        )
    )

    if error:
        return jsonify({
            "error": error
        }), 404

    return jsonify({
        "message":
            "Saved event updated",

        "saved_event":
            saved_event_schema.dump(
                updated_event
            )
    }), 200


@saved_events_bp.route(
    "/saved-events/<int:saved_event_id>",
    methods=["DELETE"]
)
@jwt_required()
def unsave_event(saved_event_id):
    """
    Remove a saved event.
    """
    user_id = int(get_jwt_identity())

    deleted = (
        SavedEventService
        .unsave_event(
            user_id,
            saved_event_id
        )
    )

    if not deleted:
        return jsonify({
            "error":
                "Saved event not found"
        }), 404

    return jsonify({
        "message":
            "Saved event removed"
    }), 200


@saved_events_bp.route(
    "/saved-events/reminders",
    methods=["GET"]
)
@jwt_required()
def get_event_reminders():
    """
    Get upcoming reminders
    for the logged-in user.
    """
    user_id = int(get_jwt_identity())

    reminders = (
        SavedEventService
        .get_upcoming_reminders(
            user_id
        )
    )

    return jsonify({
        "reminders":
            saved_events_schema.dump(
                reminders
            ),
        "total":
            len(reminders)
    }), 200