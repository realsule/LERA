from app import create_app
from models import db, User, Category, Event, Booking, Review
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()
    
    # Create admin
    admin = User(username="admin", email="admin@lera.com", role="admin")
    admin.set_password("admin123")
    
    # Create organizer
    org = User(username="org1", email="org@lera.com", role="organizer")
    org.set_password("org123")
    
    # Create user
    user = User(username="user1", email="user@lera.com", role="user")
    user.set_password("user123")
    
    db.session.add_all([admin, org, user])
    db.session.commit()
    
    # Create categories
    categories = ["Music", "Sports", "Tech", "Food", "Art"]
    for name in categories:
        cat = Category(name=name)
        db.session.add(cat)
    
    db.session.commit()
    
    # Create event
    event = Event(
        title="Concert",
        description="Live music",
        date=datetime.now() + timedelta(days=7),
        location="Nairobi",
        price=20.0,
        capacity=100,
        organizer_id=org.id,
        category_id=1
    )
    
    db.session.add(event)
    db.session.commit()
    
    print("Database seeded!")