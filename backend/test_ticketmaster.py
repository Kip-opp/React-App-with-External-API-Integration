from app import create_app
from app.services.ticketmaster import TicketmasterService

app = create_app()

with app.app_context():
    print("\n🎫 TICKETMASTER API DEBUG TOOL\n")

    api_key = app.config.get("TICKETMASTER_API_KEY")

    if not api_key:
        print("❌ TICKETMASTER_API_KEY not found")
        print("💡 Add it to your backend/.env file")
        exit()

    print(f"✅ API Key loaded: {api_key[:10]}...")

    service = TicketmasterService()

    print("\n🔍 Searching Ticketmaster events...\n")

    result = service.search_events(
        query="music",
        location="Nairobi",
        size=5
    )

    if not result:
        print("❌ Failed to fetch events from Ticketmaster")
        exit()

    print("✅ API request successful")
    print(f"📦 Response keys: {list(result.keys())}\n")

    embedded = result.get("_embedded")

    if not embedded:
        print("⚠️ No '_embedded' key found in response")
        print(result)
        exit()

    events = embedded.get("events", [])

    if not events:
        print("⚠️ No events found")
        exit()

    print(f"🎉 Found {len(events)} events\n")

    for index, event in enumerate(events[:3], start=1):
        venue_data = (
            event.get("_embedded", {})
            .get("venues", [{}])[0]
        )

        event_date = (
            event.get("dates", {})
            .get("start", {})
            .get("localDate")
        )

        print(f"========== EVENT {index} ==========")
        print(f"🎵 Name: {event.get('name')}")
        print(f"🆔 ID: {event.get('id')}")
        print(f"📍 Venue: {venue_data.get('name', 'Unknown Venue')}")
        print(f"📅 Date: {event_date}")
        print(f"🔗 URL: {event.get('url')}")
        print()

    print("🚀 Ticketmaster debug completed.\n")