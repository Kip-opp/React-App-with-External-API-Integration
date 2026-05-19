import os
import requests

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------
# LOAD ENV VARIABLES
# ---------------------------------------------------

token = os.getenv("EVENTBRITE_PRIVATE_TOKEN")
org_id = os.getenv("EVENTBRITE_ORG_ID")

print("\n🎟️ EVENTBRITE API DEBUG TOOL\n")

if token:
    print(f"✅ Token loaded: {token[:10]}...")
else:
    print("❌ EVENTBRITE_PRIVATE_TOKEN not found")

if org_id:
    print(f"✅ Organization ID loaded: {org_id}")
else:
    print("❌ EVENTBRITE_ORG_ID not found")

if not token:
    exit()

# ---------------------------------------------------
# TEST 1: SEARCH EVENTS
# ---------------------------------------------------

search_url = "https://www.eventbriteapi.com/v3/events/search/"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

search_params = {
    "q": "music",
    "page": 1
}

print("\n🔍 TEST 1 — SEARCH EVENTS")
print(f"URL: {search_url}")
print(f"Params: {search_params}")

try:
    response = requests.get(
        search_url,
        headers=headers,
        params=search_params,
        timeout=12
    )

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()

        events = data.get("events", [])

        print(f"✅ Success! Found {len(events)} events")

        if events:
            first_event = events[0]

            print("\n🎉 FIRST EVENT")
            print(
                f"Name: "
                f"{first_event.get('name', {}).get('text')}"
            )

            print(
                f"Start: "
                f"{first_event.get('start', {}).get('local')}"
            )

            print(
                f"URL: "
                f"{first_event.get('url')}"
            )

    else:
        print("❌ Search failed")
        print(response.text[:1000])

except Exception as e:
    print(f"❌ Search request failed: {str(e)}")


# ---------------------------------------------------
# TEST 2: ORGANIZATION EVENTS
# ---------------------------------------------------

if org_id:
    org_url = (
        f"https://www.eventbriteapi.com/v3/"
        f"organizations/{org_id}/events/"
    )

    org_params = {
        "status": "live",
        "page": 1
    }

    print("\n🏢 TEST 2 — ORGANIZATION EVENTS")
    print(f"URL: {org_url}")

    try:
        response = requests.get(
            org_url,
            headers=headers,
            params=org_params,
            timeout=12
        )

        print(f"\nStatus Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()

            events = data.get("events", [])

            print(
                f"✅ Organization events fetched successfully"
            )

            print(f"📅 Total organization events: {len(events)}")

            if events:
                first_event = events[0]

                print("\n🎉 FIRST ORG EVENT")
                print(
                    f"Name: "
                    f"{first_event.get('name', {}).get('text')}"
                )

        else:
            print("❌ Organization event fetch failed")
            print(response.text[:1000])

    except Exception as e:
        print(
            f"❌ Organization request failed: {str(e)}"
        )


# ---------------------------------------------------
# TEST COMPLETE
# ---------------------------------------------------

print("\n🚀 Eventbrite debug completed.\n")