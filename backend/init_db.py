from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    special_requests = db.Column(db.Text)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer)

with app.app_context():
    db.create_all()
    print("TABLES CREATED!")
    tables = db.engine.table_names()
    print("Tables:", tables)
