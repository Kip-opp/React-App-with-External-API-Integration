"""
Setup Test Events for Admin Vetting & Editing

This script creates a realistic mix of events with different statuses
so you can properly test:
- Pending events (can approve/reject)
- Rejected events (can see them in lists)
- Approved events
- Editing behavior (non-admin edits reset to pending)

Run this after you have at least one organizer and one admin account.
"""

import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"

# ============================================
# CONFIGURE YOUR TEST ACCOUNTS HERE
# ============================================

ORGANIZER = {
    "email": "asmien.sam@gmail.com",
    "password": "samaangie@123"
}

ADMIN = {
    "email": "admin@example.com",      # <-- CHANGE THIS
    "password": "admin123"             # <-- CHANGE THIS
}

# If you don't have an admin account yet, create one first via the UI
# or use the backend admin creation script.

print("=== EventSphere Test Vetting Data Setup ===\n")

# ============================================
# LOGIN HELPER
# ============================================

def login(credentials):
    print(f"🔐 Logging in as {credentials['email']}...")
    resp = requests.post(f"{BASE_URL}/auth/login", json=credentials)
    if resp.status_code != 200:
        print(f"❌ Login failed for {credentials['email']}")
        print(resp.json())
        return None
    print("✅ Login successful\n")
    return {
        "Authorization": f"Bearer {resp.json()['access_token']}",
        "Content-Type": "application/json"
    }

# ============================================
# CREATE EVENTS AS ORGANIZER (will be PENDING)
# ============================================

organizer_headers = login(ORGANIZER)
if not organizer_headers:
    exit(1)

base_date = datetime(2026, 5, 21)

events_to_create = [
    {
        "name": "[PENDING] Nairobi Tech Summit 2026",
        "description": "Major tech conference - should stay pending for testing approval flow.",
        "category": "Technology",
        "start_date": (base_date + timedelta(days=12)).isoformat(),
        "end_date": (base_date + timedelta(days=13)).isoformat(),
        "venue_name": "KICC",
        "venue_address": "City Square, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        "is_free": False,
        "currency": "KES",
        "capacity": 2500,
        "tickets": [{"name": "Standard", "price": 4500, "quantity": 2000}]
    },
    {
        "name": "[PENDING] Afrobeats All Night",
        "description": "Big music event - test rejection flow with this one.",
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
        "tickets": [{"name": "General", "price": 2500, "quantity": 6000}]
    },
    {
        "name": "[PENDING] Women in Tech Breakfast",
        "description": "Networking event - good for testing edit after creation.",
        "category": "Business",
        "start_date": (base_date + timedelta(days=4)).isoformat(),
        "end_date": (base_date + timedelta(days=4, hours=3)).isoformat(),
        "venue_name": "Sarova Stanley",
        "venue_address": "Kimathi Street, Nairobi",
        "online_event": False,
        "image_url": "https://images.unsplash.com/photo-1573164713988-8665fc963095",
        "is_free": True,
        "currency": "KES",
        "capacity": 180,
        "tickets": [{"name": "Free", "price": 0, "quantity": 180}]
    },
    {
        "name": "[PENDING] East Africa Startup Pitch",
        "description": "Startup event - will be rejected during setup for testing.",
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
        "tickets": [{"name": "General", "price": 1200, "quantity": 350}]
    },
    {
        "name": "[PENDING] Nairobi Food Festival",
        "description": "Food event - leave as pending for manual testing.",
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
        "tickets": [{"name": "Day Pass", "price": 4500, "quantity": 2200}]
    },
    {
        "name": "[PENDING] AI Masterclass (Virtual)",
        "description": "Virtual event - good for testing approve flow.",
        "category": "Education",
        "start_date": (base_date + timedelta(days=6)).isoformat(),
        "end_date": (base_date + timedelta(days=6, hours=5)).isoformat(),
        "online_event": True,
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
        "is_free": False,
        "currency": "KES",
        "capacity": 5000,
        "tickets": [{"name": "Access", "price": 1500, "quantity": 4000}]
    },
    {
        "name": "[PENDING] Safaricom Jazz Night",
        "description": "Premium event - will be approved during setup.",
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
        "tickets": [{"name": "Standard", "price": 6000, "quantity": 900}]
    },
]

print("🎉 Creating 7 test events as organizer (all will start as PENDING)...\n")

created_events = []

for i, event in enumerate(events_to_create, 1):
    resp = requests.post(f"{BASE_URL}/user/events", json=event, headers=organizer_headers)
    if resp.status_code in [200, 201]:
        event_data = resp.json().get("event", {})
        print(f"✅ [{i}/7] Created: {event['name']} (ID: {event_data.get('id')})")
        created_events.append({
            "id": event_data.get("id"),
            "name": event['name'],
            "intended_status": "pending"
        })
    else:
        print(f"❌ [{i}/7] Failed: {event['name']}")
        print("   ", resp.json())

print(f"\n✅ Created {len(created_events)} events. All currently PENDING.\n")

# ============================================
# NOW USE ADMIN TO SET DIFFERENT STATUSES
# ============================================

admin_headers = login(ADMIN)
if not admin_headers:
    print("⚠️  Could not login as admin. All events remain PENDING.")
    print("   You can manually approve/reject them from the Admin Dashboard.")
    exit(0)

print("🛡️  Using admin account to set different statuses for testing...\n")

# We will:
# - Approve 2 events
# - Reject 2 events
# - Leave 3 as pending

if len(created_events) >= 7:
    # Approve first two
    for idx in [0, 6]:
        event = created_events[idx]
        if event["id"]:
            resp = requests.patch(
                f"{BASE_URL}/admin/events/{event['id']}/approve",
                headers=admin_headers
            )
            if resp.status_code == 200:
                print(f"✅ Approved: {event['name']}")
                event["intended_status"] = "approved"
            else:
                print(f"❌ Failed to approve: {event['name']}")

    # Reject next two
    for idx in [1, 3]:
        event = created_events[idx]
        if event["id"]:
            resp = requests.patch(
                f"{BASE_URL}/admin/events/{event['id']}/reject",
                json={"admin_note": "Test rejection for UI testing"},
                headers=admin_headers
            )
            if resp.status_code == 200:
                print(f"❌ Rejected: {event['name']}")
                event["intended_status"] = "rejected"
            else:
                print(f"❌ Failed to reject: {event['name']}")

print("\n" + "="*60)
print("🎯 TEST DATA SETUP COMPLETE")
print("="*60)
print("\nCurrent distribution:")
approved = [e for e in created_events if e.get("intended_status") == "approved"]
rejected = [e for e in created_events if e.get("intended_status") == "rejected"]
pending = [e for e in created_events if e.get("intended_status") == "pending"]

print(f"  ✅ Approved:   {len(approved)}")
print(f"  ❌ Rejected:   {len(rejected)}")
print(f"  ⏳ Pending:    {len(pending)}")

print("\n📌 Now go to:")
print("   - 'Managed Events' (as admin) → You will see buttons on PENDING events")
print("   - Admin Dashboard → Pending Event Review section")
print("   - Try editing a rejected or approved event as a normal user (it should go back to pending)")

print("\n💡 Tip: If you want more rejected/approved events, you can run this script again or manually change status from the Admin UI.")