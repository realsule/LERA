import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.app import create_app
from models import db, User, Category, Event, Booking, Review
from sqlalchemy import inspect, text

app = create_app()

with app.app_context():
    print("=" * 80)
    print("DATABASE TABLES IN lera.db")
    print("=" * 80)
    
    # Get all tables
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    
    print(f"\n📊 Found {len(tables)} tables:\n")
    for i, table in enumerate(tables, 1):
        print(f"{i}. {table}")
    
    print("\n" + "=" * 80)
    print("TABLE SCHEMAS")
    print("=" * 80)
    
    for table_name in tables:
        print(f"\n📋 Table: {table_name}")
        print("-" * 80)
        columns = inspector.get_columns(table_name)
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            default = f" DEFAULT {col['default']}" if col.get('default') else ""
            print(f"  • {col['name']:20} {str(col['type']):20} {nullable}{default}")
        
        # Get row count
        result = db.session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        count = result.scalar()
        print(f"\n  📊 Total rows: {count}")
    
    print("\n" + "=" * 80)
    print("TABLE DATA PREVIEW")
    print("=" * 80)
    
    # Users table
    print("\n👥 USERS TABLE")
    print("-" * 80)
    users = User.query.all()
    print(f"{'ID':<5} {'Username':<15} {'Email':<25} {'Role':<12}")
    print("-" * 80)
    for u in users:
        print(f"{u.id:<5} {u.username:<15} {u.email:<25} {u.role:<12}")
    
    # Categories table
    print("\n📂 CATEGORIES TABLE")
    print("-" * 80)
    categories = Category.query.all()
    print(f"{'ID':<5} {'Name':<20}")
    print("-" * 80)
    for c in categories:
        print(f"{c.id:<5} {c.name:<20}")
    
    # Events table
    print("\n🎉 EVENTS TABLE")
    print("-" * 80)
    events = Event.query.all()
    print(f"{'ID':<5} {'Title':<30} {'Location':<25} {'Price':<10} {'Capacity':<10}")
    print("-" * 80)
    for e in events:
        title = e.title[:28] + ".." if len(e.title) > 30 else e.title
        location = e.location[:23] + ".." if len(e.location) > 25 else e.location
        print(f"{e.id:<5} {title:<30} {location:<25} ${e.price:<9} {e.capacity:<10}")
    
    # Bookings table
    print("\n🎫 BOOKINGS TABLE")
    print("-" * 80)
    bookings = Booking.query.all()
    print(f"{'ID':<5} {'User ID':<10} {'Event ID':<10} {'Tickets':<10} {'Total':<10} {'Status':<12}")
    print("-" * 80)
    for b in bookings:
        print(f"{b.id:<5} {b.user_id:<10} {b.event_id:<10} {b.tickets_count:<10} ${b.total_price:<9} {b.status:<12}")
    
    # Reviews table
    print("\n⭐ REVIEWS TABLE")
    print("-" * 80)
    reviews = Review.query.all()
    print(f"{'ID':<5} {'User ID':<10} {'Event ID':<10} {'Rating':<10} {'Comment':<30}")
    print("-" * 80)
    for r in reviews:
        comment = (r.comment[:28] + "..") if r.comment and len(r.comment) > 30 else (r.comment or "N/A")
        print(f"{r.id:<5} {r.user_id:<10} {r.event_id:<10} {r.rating:<10} {comment:<30}")
    
    print("\n" + "=" * 80)
