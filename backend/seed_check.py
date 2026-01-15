#!/usr/bin/env python3
"""
Database Seeding Script for LERA
=================================

This script populates the lera.db database with test data for verification:
- 1 test user (organizer role)
- 3 professional test events

Run this script after setting up the database to ensure the UI has real data to display.

Usage:
    python seed_check.py
"""

import sys
import os
from datetime import datetime, timedelta

# Add backend directory to Python path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from server.app import create_app
from models import db, User, Event, Category
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def seed_database():
    """Seed the database with test data"""
    app = create_app()
    
    with app.app_context():
        # Clear existing test data (optional - comment out if you want to keep existing data)
        print("🗑️  Clearing existing test data...")
        Event.query.filter(Event.title.like('%Test%')).delete()
        User.query.filter(User.username == 'test_organizer').delete()
        db.session.commit()
        
        # Create test user
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
        
        # Create categories if they don't exist
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
            # Check if event already exists
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
        
        # Summary
        print("\n" + "="*50)
        print("📊 SEEDING SUMMARY")
        print("="*50)
        print(f"✅ Test User: {test_user.username} ({test_user.email})")
        print(f"✅ Events Created: {len(created_events)}")
        for event in created_events:
            print(f"   - {event.title} (ID: {event.id})")
        print("="*50)
        print("\n🎉 Database seeding completed successfully!")
        print("💡 You can now test the frontend with real data from the database.")
        print(f"💡 Test user credentials: username='test_organizer', password='testpass123'")

if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
