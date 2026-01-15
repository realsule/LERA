import sys
import os

# Add parent directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from server.app import create_app
from models import db, User, Category, Event, Booking, Review
from datetime import datetime, timedelta
import random

app = create_app()

with app.app_context():
    print("🗑️  Dropping all existing tables...")
    db.drop_all()
    
    print("📦 Creating all tables...")
    db.create_all()
    
    # Create users
    print("👥 Creating users...")
    admin = User(username="admin", email="admin@lera.com", role="admin")
    admin.set_password("admin123")
    
    org1 = User(username="org1", email="org1@lera.com", role="organizer")
    org1.set_password("org123")
    
    org2 = User(username="org2", email="org2@lera.com", role="organizer")
    org2.set_password("org123")
    
    user1 = User(username="user1", email="user1@lera.com", role="user")
    user1.set_password("user123")
    
    user2 = User(username="user2", email="user2@lera.com", role="user")
    user2.set_password("user123")
    
    user3 = User(username="user3", email="user3@lera.com", role="user")
    user3.set_password("user123")
    
    db.session.add_all([admin, org1, org2, user1, user2, user3])
    db.session.commit()
    print(f"✅ Created {len([admin, org1, org2, user1, user2, user3])} users")
    
    # Create categories
    print("📂 Creating categories...")
    category_names = ["Music", "Sports", "Tech", "Food", "Art", "Comedy", "Education", "Wellness"]
    categories = []
    for name in category_names:
        cat = Category(name=name)
        categories.append(cat)
        db.session.add(cat)
    
    db.session.commit()
    print(f"✅ Created {len(categories)} categories")
    
    # Create events
    print("🎉 Creating events...")
    events_data = [
        {
            "title": "Summer Music Festival",
            "description": "A spectacular outdoor music festival featuring top artists from around the world. Join us for an unforgettable day of music, food, and fun!",
            "date": datetime.now() + timedelta(days=14),
            "location": "Nairobi National Park",
            "price": 50.0,
            "capacity": 500,
            "organizer": org1,
            "category": categories[0]  # Music
        },
        {
            "title": "Tech Innovation Summit",
            "description": "Join industry leaders and innovators for a day of talks, workshops, and networking. Explore the latest in AI, blockchain, and cloud computing.",
            "date": datetime.now() + timedelta(days=21),
            "location": "KICC, Nairobi",
            "price": 100.0,
            "capacity": 200,
            "organizer": org2,
            "category": categories[2]  # Tech
        },
        {
            "title": "Marathon Run 2024",
            "description": "Annual city marathon with routes for 5K, 10K, and full marathon. All proceeds go to charity. Register now!",
            "date": datetime.now() + timedelta(days=30),
            "location": "Uhuru Park, Nairobi",
            "price": 25.0,
            "capacity": 1000,
            "organizer": org1,
            "category": categories[1]  # Sports
        },
        {
            "title": "Food & Wine Tasting",
            "description": "Experience exquisite local and international cuisines paired with fine wines. A culinary journey you won't forget!",
            "date": datetime.now() + timedelta(days=10),
            "location": "Sarit Centre, Nairobi",
            "price": 75.0,
            "capacity": 150,
            "organizer": org2,
            "category": categories[3]  # Food
        },
        {
            "title": "Art Gallery Opening",
            "description": "Exhibition of contemporary African art featuring works from emerging and established artists. Free entry!",
            "date": datetime.now() + timedelta(days=5),
            "location": "Goethe Institute, Nairobi",
            "price": 0.0,
            "capacity": 100,
            "organizer": org1,
            "category": categories[4]  # Art
        },
        {
            "title": "Comedy Night Live",
            "description": "Laugh your heart out with Kenya's funniest comedians. An evening of pure entertainment and good vibes.",
            "date": datetime.now() + timedelta(days=7),
            "location": "Carnivore Restaurant, Nairobi",
            "price": 30.0,
            "capacity": 300,
            "organizer": org2,
            "category": categories[5]  # Comedy
        },
        {
            "title": "Web Development Bootcamp",
            "description": "Intensive 2-day bootcamp covering modern web development technologies. Perfect for beginners and intermediate developers.",
            "date": datetime.now() + timedelta(days=18),
            "location": "iHub, Nairobi",
            "price": 150.0,
            "capacity": 50,
            "organizer": org1,
            "category": categories[6]  # Education
        },
        {
            "title": "Yoga & Meditation Retreat",
            "description": "Reconnect with yourself in this peaceful retreat. Includes yoga sessions, meditation, and healthy meals.",
            "date": datetime.now() + timedelta(days=25),
            "location": "Karen, Nairobi",
            "price": 80.0,
            "capacity": 40,
            "organizer": org2,
            "category": categories[7]  # Wellness
        }
    ]
    
    events = []
    for event_data in events_data:
        event = Event(
            title=event_data["title"],
            description=event_data["description"],
            date=event_data["date"],
            location=event_data["location"],
            price=event_data["price"],
            capacity=event_data["capacity"],
            organizer_id=event_data["organizer"].id,
            category_id=event_data["category"].id
        )
        events.append(event)
        db.session.add(event)
    
    db.session.commit()
    print(f"✅ Created {len(events)} events")
    
    # Create bookings
    print("🎫 Creating bookings...")
    bookings_data = [
        {"user": user1, "event": events[0], "tickets": 2, "status": "confirmed"},
        {"user": user1, "event": events[2], "tickets": 1, "status": "confirmed"},
        {"user": user2, "event": events[1], "tickets": 1, "status": "confirmed"},
        {"user": user2, "event": events[3], "tickets": 3, "status": "pending"},
        {"user": user3, "event": events[4], "tickets": 1, "status": "confirmed"},
        {"user": user3, "event": events[5], "tickets": 2, "status": "confirmed"},
        {"user": user1, "event": events[6], "tickets": 1, "status": "pending"},
    ]
    
    bookings = []
    for booking_data in bookings_data:
        booking = Booking(
            user_id=booking_data["user"].id,
            event_id=booking_data["event"].id,
            tickets_count=booking_data["tickets"],
            total_price=booking_data["event"].price * booking_data["tickets"],
            status=booking_data["status"],
            special_requests=random.choice([
                None,
                "Please seat us near the stage",
                "Vegetarian meal preference",
                "Wheelchair accessible seating",
                "Early check-in if possible"
            ])
        )
        bookings.append(booking)
        db.session.add(booking)
    
    db.session.commit()
    print(f"✅ Created {len(bookings)} bookings")
    
    # Create reviews
    print("⭐ Creating reviews...")
    reviews_data = [
        {"user": user1, "event": events[0], "rating": 5, "comment": "Amazing event! The music was incredible and the atmosphere was electric."},
        {"user": user2, "event": events[1], "rating": 4, "comment": "Great insights from the speakers. Would attend again."},
        {"user": user3, "event": events[4], "rating": 5, "comment": "Beautiful artwork and well-organized exhibition."},
        {"user": user1, "event": events[2], "rating": 4, "comment": "Well-organized marathon. Great support along the route."},
        {"user": user2, "event": events[3], "rating": 5, "comment": "Exquisite food and excellent wine pairings. Highly recommend!"},
    ]
    
    reviews = []
    for review_data in reviews_data:
        review = Review(
            user_id=review_data["user"].id,
            event_id=review_data["event"].id,
            rating=review_data["rating"],
            comment=review_data["comment"]
        )
        reviews.append(review)
        db.session.add(review)
    
    db.session.commit()
    print(f"✅ Created {len(reviews)} reviews")
    
    print("\n" + "="*50)
    print("✅ Database successfully recreated and seeded!")
    print("="*50)
    print(f"📊 Summary:")
    print(f"   - Users: {User.query.count()}")
    print(f"   - Categories: {Category.query.count()}")
    print(f"   - Events: {Event.query.count()}")
    print(f"   - Bookings: {Booking.query.count()}")
    print(f"   - Reviews: {Review.query.count()}")
    print("="*50)