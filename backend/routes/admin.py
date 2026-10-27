from datetime import datetime

from flask import Blueprint, jsonify
from sqlalchemy import func

from models import Booking, Category, Event, User, db
from routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.order_by(User.created_at.asc(), User.id.asc()).all()
    return jsonify([user.to_dict() for user in users])


@admin_bp.route('/events', methods=['GET'])
@admin_required
def get_events():
    events = Event.query.order_by(Event.date.asc()).all()
    return jsonify([event.to_dict() for event in events])


@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    confirmed_revenue = db.session.query(
        func.coalesce(func.sum(Booking.total_price), 0)
    ).filter(Booking.status != 'cancelled').scalar()
    return jsonify({
        'total_users': User.query.count(),
        'total_events': Event.query.count(),
        'upcoming_events': Event.query.filter(Event.date > datetime.now()).count(),
        'total_categories': Category.query.count(),
        'total_bookings': Booking.query.filter(Booking.status != 'cancelled').count(),
        'tickets_reserved': db.session.query(
            func.coalesce(func.sum(Event.reserved_seats), 0)
        ).scalar(),
        'booking_value': round(float(confirmed_revenue or 0), 2),
    })


@admin_bp.route('/events/pending', methods=['GET'])
@admin_required
def get_pending_events():
    # The current schema has no approval workflow. Return an empty collection
    # instead of querying a non-existent `status` column.
    return jsonify([])
