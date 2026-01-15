#!/usr/bin/env python3
"""
Official Database Seeding Script for LERA
==========================================

This is the primary seeding script for the LERA application.
Populates the database with initial test data for development and testing.

Usage:
    python seed.py
"""

import sys
import os
from datetime import datetime, timedelta

# Add backend directory to Python path for imports
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from server.app import create_app
from models import db, User, Event, Category
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def seed_database():
    """Seed the database with official test data"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting database seeding...")
        
        # Create test user (organizer)
        print("👤 Creating test user...")
        test_user = User.query.filter_by(username='test_organizer').first()
        if not test_user:
            test_user = User(
                username='test_organizer',
                email='organizer@lera.test',
                role='organizer'
            )
            test_user.set_password('testpass123')
            db.session.add(test_user)
            db.session.commit()
            print(f"✅ Created test user: {test_user.username} (ID: {test_user.id})")
        else:
            print(f"✅ Test user already exists: {test_user.username} (ID: {test_user.id})")
        
        # Create categories
        print("📁 Creating categories...")
        categories = {}
        category_names = ['concert', 'conference', 'sports', 'workshop', 'party']
        for cat_name in category_names:
            category = Category.query.filter_by(name=cat_name).first()
            if not category:
                category = Category(name=cat_name)
                db.session.add(category)
            categories[cat_name] = category
        db.session.commit()
        print("✅ Categories ready")
        
        # Create test events
        print("🎉 Creating test events...")
        
        events_data = [
            {
                'title': 'Summer Music Festival 2024',
                'description': 'Experience the best of live music with top artists from around the world. This incredible festival features multiple stages, food vendors, and an unforgettable atmosphere.',
                'location': 'Central Park Arena, New York, NY',
                'date': datetime.now() + timedelta(days=30),
                'price': 75.00,
                'capacity': 5000,
                'category': 'concert'
            },
            {
                'title': 'Tech Innovation Summit',
                'description': 'Join industry leaders for a deep dive into the latest technology trends. Network with professionals, attend workshops, and discover cutting-edge innovations.',
                'location': 'Convention Center, San Francisco, CA',
                'date': datetime.now() + timedelta(days=45),
                'price': 299.00,
                'capacity': 1000,
                'category': 'conference'
            },
            {
                'title': 'Marathon Championship',
                'description': 'Challenge yourself in this exciting marathon event for all fitness levels. Professional timing, medals, and a celebration at the finish line.',
                'location': 'City Stadium, Chicago, IL',
                'date': datetime.now() + timedelta(days=60),
                'price': 50.00,
                'capacity': 2000,
                'category': 'sports'
            }
        ]
        
        created_events = []
        for event_data in events_data:
            existing = Event.query.filter_by(title=event_data['title']).first()
            if existing:
                print(f"⏭️  Event already exists: {event_data['title']}")
                created_events.append(existing)
                continue
            
            category = categories.get(event_data['category'])
            event = Event(
                title=event_data['title'],
                description=event_data['description'],
                location=event_data['location'],
                date=event_data['date'],
                price=event_data['price'],
                capacity=event_data['capacity'],
                organizer_id=test_user.id,
                category_id=category.id if category else None
            )
            db.session.add(event)
            created_events.append(event)
            print(f"✅ Created event: {event_data['title']}")
        
        db.session.commit()
        
        # Verification
        print("\n" + "="*50)
        print("📊 SEEDING VERIFICATION")
        print("="*50)
        user_count = User.query.count()
        event_count = Event.query.count()
        category_count = Category.query.count()
        
        print(f"✅ Users in database: {user_count}")
        print(f"✅ Events in database: {event_count}")
        print(f"✅ Categories in database: {category_count}")
        
        if user_count > 0 and event_count > 0 and category_count > 0:
            print("\n🎉 Database seeding completed successfully!")
            print("💡 Test user credentials: username='test_organizer', password='testpass123'")
        else:
            print("\n⚠️  Warning: Some tables appear to be empty!")
        print("="*50)

if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
