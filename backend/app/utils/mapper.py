def get_nested(data, *keys, default=None):
    """Safely get nested values from dictionaries."""
    current = data

    for key in keys:
        if not isinstance(current, dict):
            return default

        current = current.get(key)

        if current is None:
            return default

    return current


def map_eventbrite_event(event):
    """Transform Eventbrite event to EventSphere's consistent event format."""
    eventbrite_id = event.get("id", "")

    image_url = get_nested(event, "logo", "url")

    if not image_url:
        image_url = get_nested(event, "original", "url")

    return {
        "id": eventbrite_id,
        "external_event_id": eventbrite_id,
        "eventbrite_id": eventbrite_id,
        "source": "eventbrite",

        "name": get_nested(event, "name", "text", default="Untitled Event"),
        "description": get_nested(event, "description", "text", default=""),
        "start_date": get_nested(event, "start", "local"),
        "end_date": get_nested(event, "end", "local"),

        "url": event.get("url"),
        "event_url": event.get("url"),
        "checkout_url": event.get("url"),

        "image_url": image_url,

        "venue_name": get_nested(event, "venue", "name"),
        "venue_address": get_nested(
            event,
            "venue",
            "address",
            "localized_address_display"
        ),

        "online_event": event.get("online_event", False),
        "currency": event.get("currency", "KES"),
        "is_free": event.get("is_free", False),
        "category": get_nested(event, "category", "name", default="Event"),
        "capacity": event.get("capacity"),
        "tickets": [],
    }


def map_eventbrite_events(events_response):
    """Transform a list of Eventbrite events."""
    if not events_response or "events" not in events_response:
        return []

    return [
        map_eventbrite_event(event)
        for event in events_response.get("events", [])
    ]