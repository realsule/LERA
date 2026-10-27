from datetime import datetime

from sqlalchemy_serializer import SerializerMixin

from .user import db


class Event(db.Model, SerializerMixin):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    capacity = db.Column(db.Integer, nullable=False)
    # Optional real cover image supplied by the organizer. The frontend uses
    # a category placeholder when this is empty.
    image_url = db.Column(db.String(500))
    # Authoritative counter used for atomic capacity checks. It is incremented
    # and decremented in the same transaction as booking changes.
    reserved_seats = db.Column(db.Integer, nullable=False, default=0, server_default='0')
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Foreign keys
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))

    # Relationships
    bookings = db.relationship(
        'Booking',
        backref='event',
        lazy=True,
        cascade='all, delete-orphan'
    )
    reviews = db.relationship(
        'Review',
        backref='event',
        lazy=True,
        cascade='all, delete-orphan'
    )

    # Serialization rules
    serialize_rules = (
        '-organizer.events',
        '-bookings.event',
        '-reviews.event',
    )

    @property
    def available_tickets(self):
        return max(int(self.capacity or 0) - int(self.reserved_seats or 0), 0)

    @property
    def is_sold_out(self):
        return self.available_tickets <= 0

    @property
    def is_past(self):
        return bool(self.date and self.date < datetime.now())

    @property
    def tickets_sold(self):
        return sum(
            int(booking.tickets_count or 0)
            for booking in self.bookings
            if booking.status != 'cancelled'
        )

    @property
    def revenue(self):
        return round(
            sum(
                float(booking.total_price or 0)
                for booking in self.bookings
                if booking.status != 'cancelled'
            ),
            2,
        )

    def to_dict(self):
        ratings = [review.rating for review in self.reviews if review.rating]
        average_rating = round(sum(ratings) / len(ratings), 2) if ratings else None
        category = None
        if self.category:
            category = {'id': self.category.id, 'name': self.category.name}
        organizer = None
        if self.organizer:
            organizer = {'id': self.organizer.id, 'username': self.organizer.username}

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'location': self.location,
            'price': self.price,
            'capacity': self.capacity,
            'image_url': self.image_url,
            'reserved_seats': self.reserved_seats,
            'available_tickets': self.available_tickets,
            'is_sold_out': self.is_sold_out,
            'is_past': self.is_past,
            'tickets_sold': self.tickets_sold,
            'revenue': self.revenue,
            'average_rating': average_rating,
            'review_count': len(ratings),
            'organizer_id': self.organizer_id,
            'organizer': organizer,
            'category_id': self.category_id,
            'category': category,
            'category_name': category['name'] if category else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
