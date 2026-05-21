from datetime import datetime, timedelta

from flask import Blueprint, jsonify

from app.middleware.auth import admin_required
from app.models.event import Event
from app.models.user import User, db


analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/admin/analytics", methods=["GET"])
@admin_required
def get_admin_analytics(current_user):
    total_users = User.query.count()
    total_events = Event.query.count()

    approved_events = Event.query.filter_by(status="approved").count()
    pending_events = Event.query.filter_by(status="pending").count()
    rejected_events = Event.query.filter_by(status="rejected").count()

    total_organizers = User.query.filter_by(role="organizer").count()
    total_admins = User.query.filter_by(role="admin").count()
    total_regular_users = User.query.filter_by(role="user").count()

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_accounts = User.query.filter(User.created_at >= seven_days_ago).count()

    category_rows = (
        db.session.query(Event.category, db.func.count(Event.id))
        .group_by(Event.category)
        .all()
    )

    popular_categories = [
        {
            "category": category or "Uncategorized",
            "count": count,
        }
        for category, count in category_rows
    ]

    source_summary = {
        "EventSphere": total_events,
        "Eventbrite": 0,
        "Ticketmaster": 0,
    }

    return jsonify({
        "users": {
            "total": total_users,
            "regular_users": total_regular_users,
            "organizers": total_organizers,
            "admins": total_admins,
            "recent_accounts": recent_accounts,
        },
        "events": {
            "total": total_events,
            "approved": approved_events,
            "pending": pending_events,
            "rejected": rejected_events,
        },
        "popular_categories": popular_categories,
        "source_summary": source_summary,
    }), 200
