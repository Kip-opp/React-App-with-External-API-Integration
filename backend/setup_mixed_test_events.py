"""
Create Mixed Status Test Events for Vetting & Editing

This will create events using a NORMAL user (so they become PENDING),
then use the admin account to approve some and reject others.

This gives you a good mix to test:
- Approve button
- Reject button  
- Editing (non-admin edit should reset to pending)
- Different statuses in "Managed Events" and Admin Dashboard
"""

import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"

# ============================================
# ACCOUNTS (from your database)
# ============================================

# Normal user (events created by this will be PENDING)
ORGANIZER = {
    "email": "test.organizer@example.com",
    "password": "TestPass123!"
}

# Admin account (used to approve/reject some events)
ADMIN = {
    "email": "asmien.sam@gmail.com",
    "password": "samaangie@123"
}

print("=== Creating Mixed Status Test Events ===\n")

def login(credentials):
    print(f"🔐 Logging in as {credentials['email']}...")
    resp = requests.post(f"{BASE_URL}/auth/login", json=credentials)
    if resp.status_code != 200:
        print(f"❌ Login failed: {resp.json()}")
        return None
    print("✅ Success\n")
    return {
        "Authorization": f"Bearer {resp.json()['access_token']}",
        "Content-Type": "application/json"
    }

# Login both accounts
org_headers = login(ORGANIZER)
if not org_headers:
    print("Please check the ORGANIZER credentials (doe@gmail.com)")
    exit(1)

admin_headers = login(ADMIN)
if not admin_headers:
    print("Please check the ADMIN credentials")
    exit(1)

base_date = datetime(2026, 5, 21)

# ============================================
# CREATE 8 EVENTS AS NORMAL ORGANIZER
# (All will start as PENDING)
# ============================================

test_events = [
    {"name": "[TEST-PENDING-1] Tech Innovation Summit", "category": "Technology", "days": 10},
    {"name": "[TEST-PENDING-2] Afrobeat Night Live", "category": "Music", "days": 7},
    {"name": "[TEST-PENDING-3] Women Founders Meetup", "category": "Business", "days": 5},
    {"name": "[TEST-PENDING-4] AI for Agriculture Workshop", "category": "Education", "days": 12},
    {"name": "[TEST-PENDING-5] Nairobi Street Food Fest", "category": "Food", "days": 18},
    {"name": "[TEST-PENDING-6] Startup Demo Day", "category": "Business", "days": 9},
    {"name": "[TEST-PENDING-7] Jazz Under the Stars", "category": "Music", "days": 14},
    {"name": "[TEST-PENDING-8] Digital Marketing Masterclass", "category": "Education", "days": 6},
]

print("🎯 Creating 8 events as normal user (they will be PENDING)...\n")

created = []

for i, ev in enumerate(test_events, 1):
    event_data = {
        "name": ev["name"],
        "description": f"Test event for admin vetting. Created at {datetime.now().isoformat()}",
        "category": ev["category"],
        "start_date": (base_date + timedelta(days=ev["days"])).isoformat(),
        "end_date": (base_date + timedelta(days=ev["days"], hours=4)).isoformat(),
        "venue_name": "Test Venue",
        "venue_address": "Nairobi, Kenya",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
        "is_free": i % 3 == 0,
        "currency": "KES",
        "capacity": 500,
        "tickets": [{"name": "General", "price": 1500 if not (i % 3 == 0) else 0, "quantity": 400}]
    }

    resp = requests.post(f"{BASE_URL}/user/events", json=event_data, headers=org_headers)
    if resp.status_code in [200, 201]:
        event_id = resp.json().get("event", {}).get("id")
        print(f"✅ [{i}/8] {ev['name']} (ID: {event_id})")
        created.append({"id": event_id, "name": ev["name"]})
    else:
        print(f"❌ Failed: {ev['name']}")
        print("   ", resp.json())

print(f"\n✅ Created {len(created)} pending events.\n")

# ============================================
# USE ADMIN TO APPROVE AND REJECT SOME
# ============================================

print("🛡️ Admin is now setting different statuses...\n")

# Approve 3 events
approve_indices = [0, 2, 4]
for idx in approve_indices:
    if idx < len(created):
        ev = created[idx]
        resp = requests.patch(f"{BASE_URL}/admin/events/{ev['id']}/approve", headers=admin_headers)
        if resp.status_code == 200:
            print(f"✅ Approved: {ev['name']}")
        else:
            print(f"❌ Approve failed: {ev['name']}")

# Reject 2 events
reject_indices = [1, 5]
for idx in reject_indices:
    if idx < len(created):
        ev = created[idx]
        resp = requests.patch(
            f"{BASE_URL}/admin/events/{ev['id']}/reject",
            json={"admin_note": "Test rejection for UI testing"},
            headers=admin_headers
        )
        if resp.status_code == 200:
            print(f"❌ Rejected: {ev['name']}")
        else:
            print(f"❌ Reject failed: {ev['name']}")

print("\n" + "="*65)
print("🎉 TEST DATA READY!")
print("="*65)
print("\nStatus breakdown (approximate):")
print("  ⏳ Pending   → 3 events  (you can approve/reject these)")
print("  ✅ Approved  → 3 events")
print("  ❌ Rejected  → 2 events  (try editing these as normal user)")

print("\n📍 How to test:")
print("1. Login as admin (asmien.sam@gmail.com)")
print("2. Go to 'My Events' → '🛡️ Managed Events'")
print("3. You should see Approve/Reject buttons on the pending ones")
print("4. Try editing a rejected event while logged in as a normal user (doe@gmail.com)")
print("   → It should go back to 'pending' status")
print("5. Also check the Admin Dashboard → 'Pending Event Review' section")

print("\n💡 Tip: Refresh the page after approving/rejecting.")