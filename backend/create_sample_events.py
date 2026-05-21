import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"

# ============================================
# LOGIN AS ORGANIZER (most events will be PENDING)
# ============================================

login_data = {
    "email": "asmien.sam@gmail.com",
    "password": "samaangie@123"
}

print("🔐 Logging in as organizer...")

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)

if response.status_code != 200:
    print("❌ Login failed")
    print(response.json())
    exit()

token = response.json()["access_token"]
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
print("✅ Login successful\n")

# ============================================
# 7 SAMPLE EVENTS (good mix for admin testing)
# ============================================

base_date = datetime(2026, 5, 21)   # Today in the simulated environment

events = [
    {
        "name": "Nairobi Tech Summit 2026",
        "description": "The biggest technology conference in East Africa. Join 2000+ developers, founders, and tech leaders for 2 days of keynotes, workshops and networking.",
        "category": "Technology",
        "start_date": (base_date + timedelta(days=12)).isoformat(),
        "end_date": (base_date + timedelta(days=13)).isoformat(),
        "venue_name": "Kenyatta International Convention Centre (KICC)",
        "venue_address": "City Square, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        "is_free": False,
        "currency": "KES",
        "capacity": 2500,
        "tickets": [
            {"name": "Early Bird", "price": 3500, "quantity": 800},
            {"name": "Standard", "price": 5000, "quantity": 1200},
            {"name": "VIP", "price": 12000, "quantity": 200}
        ]
    },
    {
        "name": "Afrobeats All Night",
        "description": "The ultimate Afrobeats experience. Featuring Burna Boy, Wizkid, Tems, and the hottest DJs from Lagos and Nairobi.",
        "category": "Music",
        "start_date": (base_date + timedelta(days=8)).isoformat(),
        "end_date": (base_date + timedelta(days=8, hours=7)).isoformat(),
        "venue_name": "Uhuru Gardens",
        "venue_address": "Langata Road, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
        "is_free": False,
        "currency": "KES",
        "capacity": 8000,
        "tickets": [
            {"name": "General Admission", "price": 2500, "quantity": 6000},
            {"name": "VIP Experience", "price": 8500, "quantity": 1500}
        ]
    },
    {
        "name": "Women in Tech Leadership Breakfast",
        "description": "An intimate networking breakfast for women leading in technology across Africa. Hear from CTOs, founders and policy makers.",
        "category": "Business",
        "start_date": (base_date + timedelta(days=4)).isoformat(),
        "end_date": (base_date + timedelta(days=4, hours=3)).isoformat(),
        "venue_name": "The Sarova Stanley",
        "venue_address": "Kimathi Street, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1573164713988-8665fc963095",
        "is_free": True,
        "currency": "KES",
        "capacity": 180,
        "tickets": [
            {"name": "Free Registration", "price": 0, "quantity": 180}
        ]
    },
    {
        "name": "Future of AI in Africa (Virtual)",
        "description": "A high-impact virtual summit exploring how artificial intelligence is transforming healthcare, agriculture, finance and education across the continent.",
        "category": "Education",
        "start_date": (base_date + timedelta(days=6)).isoformat(),
        "end_date": (base_date + timedelta(days=6, hours=5)).isoformat(),
        "online_event": True,
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
        "is_free": False,
        "currency": "KES",
        "capacity": 5000,
        "tickets": [
            {"name": "Standard Access", "price": 1500, "quantity": 4500},
            {"name": "Premium + Recording", "price": 3500, "quantity": 500}
        ]
    },
    {
        "name": "Nairobi Food & Wine Festival",
        "description": "Celebrate East Africa's finest cuisine and wines. Over 80 chefs, live cooking demos, wine tastings, and a night market.",
        "category": "Food",
        "start_date": (base_date + timedelta(days=19)).isoformat(),
        "end_date": (base_date + timedelta(days=20)).isoformat(),
        "venue_name": "Carnivore Grounds",
        "venue_address": "Langata Road, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        "is_free": False,
        "currency": "KES",
        "capacity": 3000,
        "tickets": [
            {"name": "Day Pass", "price": 4500, "quantity": 2200},
            {"name": "Weekend Pass", "price": 7500, "quantity": 600}
        ]
    },
    {
        "name": "Safaricom Jazz Evening",
        "description": "An elegant evening of jazz under the stars featuring international and local jazz legends. Black tie optional.",
        "category": "Music",
        "start_date": (base_date + timedelta(days=15)).isoformat(),
        "end_date": (base_date + timedelta(days=15, hours=5)).isoformat(),
        "venue_name": "Ngong Racecourse",
        "venue_address": "Ngong Road, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d719576",
        "is_free": False,
        "currency": "KES",
        "capacity": 1200,
        "tickets": [
            {"name": "Standard", "price": 6000, "quantity": 900},
            {"name": "Premium Seating", "price": 12000, "quantity": 250}
        ]
    },
    {
        "name": "East Africa Startup Pitch Battle",
        "description": "Watch 12 of the most promising startups from Kenya, Uganda, Tanzania and Rwanda pitch for a $100,000 investment prize.",
        "category": "Business",
        "start_date": (base_date + timedelta(days=9)).isoformat(),
        "end_date": (base_date + timedelta(days=9, hours=4)).isoformat(),
        "venue_name": "iHub",
        "venue_address": "Senteu Plaza, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978",
        "is_free": False,
        "currency": "KES",
        "capacity": 450,
        "tickets": [
            {"name": "General", "price": 1200, "quantity": 350},
            {"name": "Investor Pass", "price": 5000, "quantity": 80}
        ]
    }
]

# ============================================
# CREATE THE 7 EVENTS
# ============================================

print("🎉 Creating 7 sample events for admin panel testing...\n")

created_count = 0

for i, event in enumerate(events, 1):
    response = requests.post(
        f"{BASE_URL}/user/events",
        json=event,
        headers=headers
    )

    if response.status_code in [200, 201]:
        print(f"✅ [{i}/7] Created: {event['name']}")
        created_count += 1
    else:
        print(f"❌ [{i}/7] Failed: {event['name']}")
        print("   Error:", response.json())

print(f"\n🚀 Done! Successfully created {created_count} out of 7 events.")
print("\n📌 Next steps for testing the admin panel:")
print("   1. Log in as an ADMIN user")
print("   2. Go to Admin Dashboard")
print("   3. You should see several events in 'Pending' status ready for vetting")
print("   4. Use the Approve / Reject buttons in the 'Pending Event Review' section")
print("\n💡 Tip: Most events are created as PENDING (normal organizer flow).")