"""
Load Test Events for Admin Vetting Functionality

Creates:
- 4 events with status = 'pending'
- 1 event with status = 'rejected'

This allows you to properly test:
- Approve/Reject buttons in "Managed Events" (MyEventsView)
- Pending Event Review section in Admin Dashboard
- Editing behavior on rejected/pending events

Run this while the backend is NOT necessarily running (direct DB access).
"""

from datetime import datetime, timedelta
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models.user import User, db
from app.models.event import Event

app = create_app()

with app.app_context():
    print("=== Loading Test Events for Admin Vetting ===\n")

    # Find or create a test organizer
    organizer = User.query.filter_by(email="test.organizer@example.com").first()
    
    if not organizer:
        print("❌ Test organizer not found. Creating one...")
        from werkzeug.security import generate_password_hash
        organizer = User(
            username="testorganizer",
            email="test.organizer@example.com",
            role="organizer",
            is_active=True,
            organizer_verified=True
        )
        organizer.set_password("TestPass123!")
        db.session.add(organizer)
        db.session.commit()
        print("✅ Created test organizer: test.organizer@example.com / TestPass123!\n")
    else:
        print(f"✅ Using existing organizer: {organizer.email}\n")

    # Clear any previous test events (optional - comment out if you want to keep old ones)
    deleted = Event.query.filter(Event.name.like('[TEST-%')).delete()
    if deleted > 0:
        db.session.commit()
        print(f"🧹 Removed {deleted} old test events\n")

    base_date = datetime(2026, 5, 21)  # Current sim time

    test_events = [
        # 4 PENDING events
        {
            "name": "[TEST-PENDING-1] Nairobi Tech Summit 2026",
            "description": "Major technology conference in East Africa. Testing pending approval flow.",
            "category": "Technology",
            "start_date": base_date + timedelta(days=12),
            "end_date": base_date + timedelta(days=13),
            "venue_name": "KICC",
            "venue_address": "City Square, Nairobi",
            "online_event": False,
            "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            "is_free": False,
            "currency": "KES",
            "capacity": 2500,
            "status": "pending",
        },
        {
            "name": "[TEST-PENDING-2] Afrobeats All Night",
            "description": "Big music festival. Use this to test the Reject button.",
            "category": "Music",
            "start_date": base_date + timedelta(days=8),
            "end_date": base_date + timedelta(days=8, hours=7),
            "venue_name": "Uhuru Gardens",
            "venue_address": "Langata Road, Nairobi",
            "online_event": False,
            "image_url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
            "is_free": False,
            "currency": "KES",
            "capacity": 8000,
            "status": "pending",
        },
        {
            "name": "[TEST-PENDING-3] Women in Tech Leadership Breakfast",
            "description": "Intimate networking event for women in tech. Good for testing edit flow.",
            "category": "Business",
            "start_date": base_date + timedelta(days=4),
            "end_date": base_date + timedelta(days=4, hours=3),
            "venue_name": "The Sarova Stanley",
            "venue_address": "Kimathi Street, Nairobi",
            "online_event": False,
            "image_url": "https://images.unsplash.com/photo-1573164713988-8665fc963095",
            "is_free": True,
            "currency": "KES",
            "capacity": 180,
            "status": "pending",
        },
        {
            "name": "[TEST-PENDING-4] East Africa Startup Pitch Battle",
            "description": "Startup competition with $100k prize. Test approve/reject here.",
            "category": "Business",
            "start_date": base_date + timedelta(days=9),
            "end_date": base_date + timedelta(days=9, hours=4),
            "venue_name": "iHub",
            "venue_address": "Senteu Plaza, Nairobi",
            "online_event": False,
            "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978",
            "is_free": False,
            "currency": "KES",
            "capacity": 450,
            "status": "pending",
        },
        # 1 REJECTED event
        {
            "name": "[TEST-REJECTED-1] Nairobi Food & Wine Festival",
            "description": "This event was rejected during testing. Try editing it as an organizer.",
            "category": "Food",
            "start_date": base_date + timedelta(days=19),
            "end_date": base_date + timedelta(days=20),
            "venue_name": "Carnivore Grounds",
            "venue_address": "Langata Road, Nairobi",
            "online_event": False,
            "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
            "is_free": False,
            "currency": "KES",
            "capacity": 3000,
            "status": "rejected",
            "admin_note": "Test rejection - insufficient details and overlapping dates with another major event.",
        },
    ]

    created_count = 0

    for event_data in test_events:
        event = Event(
            user_id=organizer.id,
            name=event_data["name"],
            description=event_data["description"],
            category=event_data["category"],
            start_date=event_data["start_date"],
            end_date=event_data["end_date"],
            venue_name=event_data["venue_name"],
            venue_address=event_data.get("venue_address"),
            online_event=event_data.get("online_event", False),
            image_url=event_data.get("image_url"),
            is_free=event_data.get("is_free", False),
            currency=event_data.get("currency", "KES"),
            capacity=event_data.get("capacity", 500),
            status=event_data["status"],
            admin_note=event_data.get("admin_note"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.session.add(event)
        created_count += 1
        print(f"✅ Created: {event_data['name']}  (status: {event_data['status']})")

    db.session.commit()

    print(f"\n🎉 Successfully loaded {created_count} test events!")
    print("\n" + "="*60)
    print("STATUS BREAKDOWN:")
    print(f"  ⏳ Pending:   4 events")
    print(f"  ❌ Rejected:  1 event")
    print("="*60)
    print("\n📍 Next steps to test admin functionality:")
    print("1. Login as admin (asmien.sam@gmail.com / samaangie@123)")
    print("2. Go to 'My Events' → You should see '🛡️ Managed Events'")
    print("3. Look for events with [TEST-PENDING-...] labels")
    print("4. You should now see the ✓ Approve and ✗ Reject buttons")
    print("5. Also check Admin Dashboard → 'Pending Event Review' section")
    print("\n💡 Tip: Try editing the rejected event while logged in as the test organizer.")
    print("   It should reset back to 'pending' status.")