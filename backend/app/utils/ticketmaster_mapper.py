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


def map_ticketmaster_event(event):
    """Transform Ticketmaster event to EventSphere's consistent event format."""
    images = event.get("images", [])
    image_url = images[0].get("url") if images else None

    venues = get_nested(event, "_embedded", "venues", default=[])
    venue = venues[0] if venues else {}

    classifications = event.get("classifications", [])
    classification = classifications[0] if classifications else {}

    segment = classification.get("segment", {})
    genre = classification.get("genre", {})
    subgenre = classification.get("subGenre", {})

    price_ranges = event.get("priceRanges", [])
    price_info = price_ranges[0] if price_ranges else {}

    venue_address_parts = [
        get_nested(venue, "address", "line1"),
        get_nested(venue, "address", "line2"),
        get_nested(venue, "city", "name"),
        get_nested(venue, "state", "stateCode"),
        venue.get("postalCode"),
    ]

    full_venue_address = ", ".join(
        part for part in venue_address_parts if part
    )

    attractions = get_nested(event, "_embedded", "attractions", default=[])
    artists = [
        attraction.get("name")
        for attraction in attractions
        if attraction.get("name")
    ]

    promoter = event.get("promoter", {})

    ticketmaster_id = event.get("id")

    return {
        "id": ticketmaster_id,
        "external_event_id": ticketmaster_id,
        "ticketmaster_id": ticketmaster_id,
        "source": "ticketmaster",

        "name": event.get("name", "Untitled Event"),
        "description": event.get("info") or event.get("pleaseNote") or "",
        "start_date": get_nested(event, "dates", "start", "dateTime"),
        "end_date": None,

        "url": event.get("url"),
        "event_url": event.get("url"),
        "checkout_url": event.get("url"),

        "image_url": image_url,

        "venue_name": venue.get("name", "TBD"),
        "venue_address": full_venue_address or "Address TBD",
        "venue_city": get_nested(venue, "city", "name"),
        "venue_state": get_nested(venue, "state", "stateCode"),
        "venue_country": get_nested(venue, "country", "countryCode"),
        "venue_postal_code": venue.get("postalCode"),
        "venue_phone": venue.get("phoneNumber"),
        "venue_url": venue.get("url"),
        "venue_capacity": venue.get("capacity"),

        "online_event": False,
        "currency": price_info.get("currency", "USD"),
        "is_free": not bool(price_info),

        "category": segment.get("name", "Entertainment"),
        "genre": genre.get("name"),
        "subgenre": subgenre.get("name"),

        "min_price": price_info.get("min"),
        "max_price": price_info.get("max"),

        "artists": artists,
        "promoter_name": promoter.get("name"),
        "status": event.get("status"),
        "tickets": [],
    }


def map_ticketmaster_events(ticketmaster_response):
    """Transform a list of Ticketmaster events."""
    if not ticketmaster_response or "_embedded" not in ticketmaster_response:
        return []

    events = ticketmaster_response["_embedded"].get("events", [])

    return [
        map_ticketmaster_event(event)
        for event in events
    ]