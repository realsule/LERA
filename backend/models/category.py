from sqlalchemy_serializer import SerializerMixin
from .user import db


class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    # Relationships
    events = db.relationship('Event', backref='category', lazy=True)

    # Serialization rules
    serialize_rules = ('-events.category',)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }
