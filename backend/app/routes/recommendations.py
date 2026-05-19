from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.event import Event
from app.models.saved_event import SavedEvent


recommendations_bp = Blueprint("recommendations", __name__)


@recommendations_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def get_recommendations():
    user_id = int(get_jwt_identity())

    saved_events = SavedEvent.query.filter_by(user_id=user_id).all()

    saved_categories = list({
        saved_event.category
        for saved_event in saved_events
        if saved_event.category
    })

    query = Event.query.filter_by(status="approved")

    if saved_categories:
        recommended_events = (
            query
            .filter(Event.category.in_(saved_categories))
            .order_by(Event.start_date.asc())
            .limit(8)
            .all()
        )
    else:
        recommended_events = (
            query
            .order_by(Event.start_date.asc())
            .limit(8)
            .all()
        )

    return jsonify({
        "recommendations": [
            {
                **event.to_dict(),
                "source": "local",
                "recommendation_reason": (
                    "Based on your saved event categories"
                    if saved_categories
                    else "Upcoming approved event"
                ),
            }
            for event in recommended_events
        ],
        "total": len(recommended_events),
        "based_on_categories": saved_categories,
    }), 200