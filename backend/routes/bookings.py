from flask import Blueprint, request, jsonify, session
from models import db, Booking, Event
from routes.auth import login_required

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@login_required
def create_booking():
    data = request.get_json()
    
    booking = Booking(
        user_id=session['user_id'],
        event_id=data['event_id'],
        tickets_count=data['tickets_count'],
        total_price=data.get('total_price', 0),
        special_requests=data.get('special_requests')
    )
    
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201

@bookings_bp.route('/', methods=['GET'])
@login_required
def get_bookings():
    bookings = Booking.query.filter_by(user_id=session['user_id']).all()
    return jsonify([b.to_dict() for b in bookings])

@bookings_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_booking(id):
    booking = Booking.query.get_or_404(id)
    
    if booking.user_id != session['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(booking)
    db.session.commit()
    return jsonify({"message": "Booking cancelled"})