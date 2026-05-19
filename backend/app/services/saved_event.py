from datetime import datetime, timedelta

from app.models.saved_event import SavedEvent
from app.models.user import db


class SavedEventService:
    @staticmethod
    def get_saved_events(user_id):
        return (
            SavedEvent.query
            .filter_by(user_id=int(user_id))
            .order_by(SavedEvent.saved_at.desc())
            .all()
        )

    @staticmethod
    def save_event(user_id, data):
        existing = (
            SavedEvent.query
            .filter_by(
                user_id=int(user_id),
                external_event_id=data.get("external_event_id"),
                source=data.get("source")
            )
            .first()
        )

        if existing:
            return None, "Event already saved"

        saved_event = SavedEvent(
            user_id=int(user_id),
            external_event_id=data.get("external_event_id"),
            source=data.get("source"),
            event_name=data.get("event_name"),
            event_description=data.get("event_description"),
            venue_name=data.get("venue_name"),
            venue_address=data.get("venue_address"),
            image_url=data.get("image_url"),
            event_url=data.get("event_url"),
            event_date=data.get("event_date"),
            category=data.get("category"),
            reminder_enabled=data.get("reminder_enabled", True),
            reminder_datetime=data.get("reminder_datetime"),
            notes=data.get("notes")
        )

        db.session.add(saved_event)
        db.session.commit()

        return saved_event, None

    @staticmethod
    def update_saved_event(user_id, saved_event_id, data):
        saved_event = (
            SavedEvent.query
            .filter_by(
                id=saved_event_id,
                user_id=int(user_id)
            )
            .first()
        )

        if not saved_event:
            return None, "Saved event not found"

        allowed_fields = [
            "reminder_enabled",
            "reminder_datetime",
            "notes"
        ]

        for field in allowed_fields:
            if field in data:
                if field == "reminder_datetime" and data[field]:
                    try:
                        saved_event.reminder_datetime = datetime.fromisoformat(
                            data[field].replace("Z", "+00:00")
                        )
                    except Exception:
                        return None, "Invalid reminder_datetime format"
                else:
                    setattr(saved_event, field, data[field])

        saved_event.updated_at = datetime.utcnow()

        db.session.commit()

        return saved_event, None

    @staticmethod
    def unsave_event(user_id, saved_event_id):
        saved_event = (
            SavedEvent.query
            .filter_by(
                id=saved_event_id,
                user_id=int(user_id)
            )
            .first()
        )

        if not saved_event:
            return False

        db.session.delete(saved_event)
        db.session.commit()

        return True

    @staticmethod
    def check_if_saved(user_id, external_event_id, source):
        saved_event = (
            SavedEvent.query
            .filter_by(
                user_id=int(user_id),
                external_event_id=external_event_id,
                source=source
            )
            .first()
        )

        if not saved_event:
            return {
                "is_saved": False,
                "saved_event_id": None
            }

        return {
            "is_saved": True,
            "saved_event_id": saved_event.id
        }

    @staticmethod
    def get_upcoming_reminders(user_id):
        """
        Return saved events with reminder dates coming up.

        This prepares the backend for future real-time notifications.
        """
        now = datetime.utcnow()
        upcoming_window = now + timedelta(days=7)

        return (
            SavedEvent.query
            .filter(
                SavedEvent.user_id == int(user_id),
                SavedEvent.reminder_enabled.is_(True),
                SavedEvent.reminder_datetime.isnot(None),
                SavedEvent.reminder_datetime >= now,
                SavedEvent.reminder_datetime <= upcoming_window
            )
            .order_by(SavedEvent.reminder_datetime.asc())
            .all()
        )

    @staticmethod
    def mark_reminder_sent(saved_event_id):
        saved_event = SavedEvent.query.get(saved_event_id)

        if not saved_event:
            return None, "Saved event not found"

        saved_event.reminder_sent = True
        saved_event.updated_at = datetime.utcnow()

        db.session.commit()

        return saved_event, None