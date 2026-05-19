import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"

# ---------------------------------------------------
# LOGIN AS ORGANIZER OR ADMIN
# ---------------------------------------------------

login_data = {
    "email": "asmien.sam@gmail.com",
    "password": "samaangie@123"
}

print("🔐 Logging in...")

response = requests.post(
    f"{BASE_URL}/auth/login",
    json=login_data
)

if response.status_code != 200:
    print("❌ Login failed")
    print(response.json())
    exit()

token = response.json()["access_token"]

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("✅ Login successful")


# ---------------------------------------------------
# SAMPLE EVENTS
# ---------------------------------------------------

events = [
    {
        "name": "Afrobeats Summer Festival",
        "description": "An unforgettable Afrobeats festival featuring top African artists, DJs, food vendors, and immersive nightlife experiences.",
        "category": "Music",
        "start_date": (
            datetime.now() + timedelta(days=14)
        ).isoformat(),

        "end_date": (
            datetime.now() + timedelta(days=14, hours=8)
        ).isoformat(),

        "venue_name": "Uhuru Gardens",
        "venue_address": "Langata Road, Nairobi",

        "online_event": False,

        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",

        "is_free": False,
        "currency": "KES",
        "capacity": 5000,

        "tickets": [
            {
                "name": "Regular",
                "price": 2500,
                "quantity": 4000
            },
            {
                "name": "VIP",
                "price": 7500,
                "quantity": 1000
            }
        ]
    },

    {
        "name": "Startup Pitch Night",
        "description": "Watch innovative entrepreneurs pitch groundbreaking ideas to investors, founders, and tech leaders.",

        "category": "Business",

        "start_date": (
            datetime.now() + timedelta(days=5)
        ).isoformat(),

        "end_date": (
            datetime.now() + timedelta(days=5, hours=3)
        ).isoformat(),

        "venue_name": "Nailab",
        "venue_address": "Westlands, Nairobi",

        "online_event": False,

        "image_url": "https://images.unsplash.com/photo-1515169067868-5387ec356754",

        "is_free": True,
        "currency": "KES",
        "capacity": 300,

        "tickets": [
            {
                "name": "Free Entry",
                "price": 0,
                "quantity": 300
            }
        ]
    },

    {
        "name": "AI & Machine Learning Masterclass",
        "description": "A virtual workshop covering AI fundamentals, neural networks, recommendation systems, and real-world machine learning applications.",

        "category": "Education",

        "start_date": (
            datetime.now() + timedelta(days=3)
        ).isoformat(),

        "end_date": (
            datetime.now() + timedelta(days=3, hours=4)
        ).isoformat(),

        "online_event": True,

        "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995",

        "is_free": False,
        "currency": "KES",
        "capacity": 1000,

        "tickets": [
            {
                "name": "Workshop Access",
                "price": 2000,
                "quantity": 1000
            }
        ]
    },

    {
        "name": "Fashion & Creative Expo",
        "description": "A creative showcase bringing together fashion designers, photographers, models, and lifestyle brands.",

        "category": "Fashion",

        "start_date": (
            datetime.now() + timedelta(days=20)
        ).isoformat(),

        "end_date": (
            datetime.now() + timedelta(days=20, hours=6)
        ).isoformat(),

        "venue_name": "KICC",
        "venue_address": "City Square, Nairobi",

        "online_event": False,

        "image_url": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",

        "is_free": False,
        "currency": "KES",
        "capacity": 1500,

        "tickets": [
            {
                "name": "General Access",
                "price": 1200,
                "quantity": 1200
            },
            {
                "name": "Backstage Pass",
                "price": 5000,
                "quantity": 300
            }
        ]
    }
]


# ---------------------------------------------------
# CREATE EVENTS
# ---------------------------------------------------

print("\n🎉 Creating sample events...\n")

for event in events:
    response = requests.post(
        f"{BASE_URL}/user/events",
        json=event,
        headers=headers
    )

    if response.status_code in [200, 201]:
        print(f"✅ Created: {event['name']}")
    else:
        print(f"❌ Failed: {event['name']}")
        print(response.json())

print("\n🚀 Sample events created successfully!")
print("💡 Refresh your frontend to view the new events.")