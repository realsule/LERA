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

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'location': self.location,
            'price': self.price,
            'capacity': self.capacity,
            'organizer_id': self.organizer_id,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
