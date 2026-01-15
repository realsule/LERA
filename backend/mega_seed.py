#!/usr/bin/env python3
"""
Mega Database Seeding Script for LERA
======================================

Populates the database with large-scale test data:
- 15+ diverse events across multiple categories
- 5 test users (admin, organizer, attendees)
- 10 categories
- Realistic descriptions and data

Usage:
    python mega_seed.py
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add backend directory to Python path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from server.app import create_app
from models import db, User, Event, Category

def seed_database():
    """Seed the database with large-scale test data"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting mega database seeding...")
        
        # Clear existing data (optional - comment out to keep existing data)
        print("🗑️  Clearing existing data...")
        Event.query.delete()
        User.query.filter(User.email.like('%@lera.com')).delete()
        Category.query.delete()
        db.session.commit()
        
        # Create 10 categories
        print("📁 Creating categories...")
        category_names = [
            'concert', 'conference', 'sports', 'workshop', 'party',
            'art', 'technology', 'music', 'theater', 'networking'
        ]
        categories = {}
        for cat_name in category_names:
            category = Category(name=cat_name)
            db.session.add(category)
            categories[cat_name] = category
        db.session.commit()
        print(f"✅ Created {len(categories)} categories")
        
        # Create 5 test users
        print("👥 Creating test users...")
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@lera.com',
                'role': 'admin',
                'password': 'password123'
            },
            {
                'username': 'organizer',
                'email': 'organizer@lera.com',
                'role': 'organizer',
                'password': 'password123'
            },
            {
                'username': 'attendee1',
                'email': 'attendee1@lera.com',
                'role': 'attendee',
                'password': 'password123'
            },
            {
                'username': 'attendee2',
                'email': 'attendee2@lera.com',
                'role': 'attendee',
                'password': 'password123'
            },
            {
                'username': 'attendee3',
                'email': 'attendee3@lera.com',
                'role': 'attendee',
                'password': 'password123'
            }
        ]
        
        created_users = {}
        for user_data in users_data:
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                role=user_data['role']
            )
            user.set_password(user_data['password'])
            db.session.add(user)
            created_users[user_data['email']] = user
        db.session.commit()
        print(f"✅ Created {len(created_users)} users")
        
        # Create 15+ diverse events
        print("🎉 Creating events...")
        events_data = [
            {
                'title': 'Summer Music Festival 2024',
                'description': 'Experience the best of live music with top artists from around the world. This incredible festival features multiple stages, food vendors, and an unforgettable atmosphere. Join thousands of music lovers for a day of amazing performances, great food, and fantastic vibes.',
                'location': 'Central Park Arena, New York, NY',
                'date': datetime.now() + timedelta(days=30),
                'price': 75.00,
                'capacity': 5000,
                'category': 'music',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Tech Innovation Summit',
                'description': 'Join industry leaders for a deep dive into the latest technology trends. Network with professionals, attend workshops, and discover cutting-edge innovations. This premier tech conference brings together innovators, entrepreneurs, and investors from around the globe.',
                'location': 'Convention Center, San Francisco, CA',
                'date': datetime.now() + timedelta(days=45),
                'price': 299.00,
                'capacity': 1000,
                'category': 'technology',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Marathon Championship',
                'description': 'Challenge yourself in this exciting marathon event for all fitness levels. Professional timing, medals, and a celebration at the finish line. Whether you\'re a seasoned runner or a beginner, this event offers something for everyone.',
                'location': 'City Stadium, Chicago, IL',
                'date': datetime.now() + timedelta(days=60),
                'price': 50.00,
                'capacity': 2000,
                'category': 'sports',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Jazz Night at Blue Note',
                'description': 'An intimate evening of smooth jazz featuring world-renowned musicians. Experience the magic of live jazz in an elegant setting with premium acoustics and exceptional performances.',
                'location': 'Blue Note Jazz Club, New York, NY',
                'date': datetime.now() + timedelta(days=15),
                'price': 45.00,
                'capacity': 300,
                'category': 'music',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'AI & Machine Learning Workshop',
                'description': 'Hands-on workshop covering the fundamentals of AI and machine learning. Learn from industry experts, work on real projects, and network with fellow developers. Perfect for beginners and intermediate developers.',
                'location': 'Tech Hub, Seattle, WA',
                'date': datetime.now() + timedelta(days=25),
                'price': 199.00,
                'capacity': 150,
                'category': 'workshop',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Contemporary Art Exhibition',
                'description': 'Explore stunning contemporary artworks from emerging and established artists. This curated exhibition features paintings, sculptures, and digital art installations. Meet the artists and enjoy refreshments.',
                'location': 'Modern Art Gallery, Los Angeles, CA',
                'date': datetime.now() + timedelta(days=20),
                'price': 25.00,
                'capacity': 500,
                'category': 'art',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Basketball Championship Finals',
                'description': 'Watch the ultimate showdown as the top teams compete for the championship title. Experience the excitement of professional basketball with premium seating and exclusive access.',
                'location': 'Madison Square Garden, New York, NY',
                'date': datetime.now() + timedelta(days=40),
                'price': 150.00,
                'capacity': 18000,
                'category': 'sports',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Startup Networking Mixer',
                'description': 'Connect with entrepreneurs, investors, and innovators in a relaxed networking environment. Share ideas, find collaborators, and build meaningful business relationships. Includes drinks and appetizers.',
                'location': 'Innovation Hub, Austin, TX',
                'date': datetime.now() + timedelta(days=10),
                'price': 35.00,
                'capacity': 200,
                'category': 'networking',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Broadway Musical: The Phantom',
                'description': 'Experience the magic of Broadway with this spectacular musical production. Featuring stunning sets, incredible performances, and unforgettable music. A must-see theatrical experience.',
                'location': 'Majestic Theatre, New York, NY',
                'date': datetime.now() + timedelta(days=35),
                'price': 120.00,
                'capacity': 1600,
                'category': 'theater',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Electronic Dance Music Festival',
                'description': 'Dance the night away with world-famous DJs and electronic music artists. Multiple stages, incredible light shows, and an unforgettable party atmosphere. 18+ event.',
                'location': 'Festival Grounds, Miami, FL',
                'date': datetime.now() + timedelta(days=50),
                'price': 89.00,
                'capacity': 10000,
                'category': 'party',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Web Development Bootcamp',
                'description': 'Intensive 3-day bootcamp covering modern web development technologies. Learn React, Node.js, and full-stack development from industry professionals. Includes hands-on projects and career guidance.',
                'location': 'Coding Academy, San Francisco, CA',
                'date': datetime.now() + timedelta(days=55),
                'price': 499.00,
                'capacity': 50,
                'category': 'workshop',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Classical Symphony Concert',
                'description': 'An evening of classical masterpieces performed by a world-renowned symphony orchestra. Experience the beauty of classical music in an elegant concert hall setting.',
                'location': 'Carnegie Hall, New York, NY',
                'date': datetime.now() + timedelta(days=28),
                'price': 65.00,
                'capacity': 2800,
                'category': 'music',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Cybersecurity Conference 2024',
                'description': 'Stay ahead of cyber threats with insights from leading security experts. Learn about the latest threats, defense strategies, and emerging technologies in cybersecurity.',
                'location': 'Convention Center, Las Vegas, NV',
                'date': datetime.now() + timedelta(days=65),
                'price': 399.00,
                'capacity': 800,
                'category': 'conference',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Soccer World Cup Viewing Party',
                'description': 'Join fellow soccer fans to watch the World Cup final on a massive screen. Enjoy food, drinks, and the excitement of the game in a festive atmosphere.',
                'location': 'Sports Bar & Grill, Boston, MA',
                'date': datetime.now() + timedelta(days=18),
                'price': 20.00,
                'capacity': 400,
                'category': 'sports',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Photography Masterclass',
                'description': 'Learn advanced photography techniques from award-winning photographers. Covers composition, lighting, post-processing, and portfolio development. Bring your camera!',
                'location': 'Art Institute, Portland, OR',
                'date': datetime.now() + timedelta(days=32),
                'price': 149.00,
                'capacity': 30,
                'category': 'workshop',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Rock Concert: Legends Tour',
                'description': 'See legendary rock bands perform their greatest hits live. A once-in-a-lifetime concert experience featuring multiple iconic bands on one stage.',
                'location': 'Stadium, Los Angeles, CA',
                'date': datetime.now() + timedelta(days=42),
                'price': 95.00,
                'capacity': 50000,
                'category': 'concert',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Blockchain & Crypto Summit',
                'description': 'Explore the future of blockchain technology and cryptocurrency. Network with industry leaders, learn about DeFi, NFTs, and the latest blockchain innovations.',
                'location': 'Tech Center, Denver, CO',
                'date': datetime.now() + timedelta(days=38),
                'price': 249.00,
                'capacity': 600,
                'category': 'conference',
                'organizer': 'organizer@lera.com'
            },
            {
                'title': 'Yoga & Wellness Retreat',
                'description': 'Rejuvenate your mind and body with a day of yoga, meditation, and wellness activities. Includes healthy meals, workshops, and relaxation sessions.',
                'location': 'Wellness Center, Sedona, AZ',
                'date': datetime.now() + timedelta(days=22),
                'price': 79.00,
                'capacity': 100,
                'category': 'workshop',
                'organizer': 'organizer@lera.com'
            }
        ]
        
        created_events = []
        for event_data in events_data:
            category = categories.get(event_data['category'])
            organizer = created_users.get(event_data['organizer'])
            
            if not organizer:
                print(f"⚠️  Organizer not found: {event_data['organizer']}")
                continue
            
            event = Event(
                title=event_data['title'],
                description=event_data['description'],
                location=event_data['location'],
                date=event_data['date'],
                price=event_data['price'],
                capacity=event_data['capacity'],
                organizer_id=organizer.id,
                category_id=category.id if category else None
            )
            db.session.add(event)
            created_events.append(event)
        
        db.session.commit()
        print(f"✅ Created {len(created_events)} events")
        
        # Verification
        print("\n" + "="*60)
        print("📊 MEGA SEEDING VERIFICATION")
        print("="*60)
        user_count = User.query.count()
        event_count = Event.query.count()
        category_count = Category.query.count()
        
        print(f"✅ Users in database: {user_count}")
        print(f"✅ Events in database: {event_count}")
        print(f"✅ Categories in database: {category_count}")
        
        print("\n👥 Created Users:")
        for email, user in created_users.items():
            print(f"   - {user.username} ({email}) - Role: {user.role}")
        
        print("\n📁 Created Categories:")
        for name, category in categories.items():
            event_count_for_cat = Event.query.filter_by(category_id=category.id).count()
            print(f"   - {name}: {event_count_for_cat} events")
        
        if user_count >= 5 and event_count >= 15 and category_count >= 10:
            print("\n🎉 Mega seeding completed successfully!")
            print("\n💡 Test Credentials:")
            print("   - admin@lera.com / password123 (Admin)")
            print("   - organizer@lera.com / password123 (Organizer)")
            print("   - attendee1@lera.com / password123 (Attendee)")
        else:
            print("\n⚠️  Warning: Some requirements not met!")
        print("="*60)

if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
