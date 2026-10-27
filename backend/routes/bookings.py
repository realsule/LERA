from datetime import datetime

from flask import Blueprint, jsonify, request

from models import Booking, Event, db
from routes.auth import get_current_user, login_required

bookings_bp = Blueprint('bookings', __name__)


def _parse_positive_int(value, field):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be an integer")
    if parsed < 1:
        raise ValueError(f"{field} must be at least 1")
    return parsed


@bookings_bp.route('/', methods=['POST'])
@login_required
def create_booking():
    data = request.get_json(silent=True) or {}
    user = get_current_user()

    try:
        event_id = _parse_positive_int(data.get('event_id'), 'event_id')
        tickets_count = _parse_positive_int(data.get('tickets_count', 1), 'tickets_count')
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    special_requests = data.get('special_requests')
    if special_requests is not None:
        special_requests = str(special_requests).strip()[:1000] or None

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    if event.date <= datetime.now():
        return jsonify({"error": "This event has already taken place"}), 409
    if tickets_count > event.available_tickets:
        return jsonify({
            "error": f"Only {event.available_tickets} ticket(s) remain for this event",
            "available_tickets": event.available_tickets,
        }), 409

    # Atomic reservation: the UPDATE only succeeds while enough capacity
    # remains. This protects against two concurrent bookings overselling the
    # last seat on both SQLite and PostgreSQL.
    reserved = db.session.query(Event).filter(
        Event.id == event_id,
        Event.reserved_seats + tickets_count <= Event.capacity,
    ).update(
        {Event.reserved_seats: Event.reserved_seats + tickets_count},
        synchronize_session=False,
    )
    if reserved != 1:
        db.session.rollback()
        db.session.refresh(event)
        return jsonify({
            "error": "Not enough tickets remain for this event",
            "available_tickets": event.available_tickets,
        }), 409

    # Price is always calculated from the server-side event record. A client
    # supplied total is deliberately ignored.
    booking = Booking(
        user_id=user.id,
        event_id=event_id,
        tickets_count=tickets_count,
        total_price=round(float(event.price or 0) * tickets_count, 2),
        status='pending',
        special_requests=special_requests,
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201


@bookings_bp.route('/', methods=['GET'])
@login_required
def get_bookings():
    user = get_current_user()
    bookings = (
        Booking.query
        .filter_by(user_id=user.id)
        .order_by(Booking.created_at.desc(), Booking.id.desc())
        .all()
    )
    return jsonify([booking.to_dict() for booking in bookings])


@bookings_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_booking(id):
    user = get_current_user()
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking.user_id != user.id and not user.is_admin():
        return jsonify({"error": "You cannot view this booking"}), 403
    return jsonify(booking.to_dict())


@bookings_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def cancel_booking(id):
    user = get_current_user()
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking.user_id != user.id and not user.is_admin():
        return jsonify({"error": "You cannot cancel this booking"}), 403

    if booking.status == 'cancelled':
        return jsonify(booking.to_dict())

    released = db.session.query(Event).filter(
        Event.id == booking.event_id,
        Event.reserved_seats >= booking.tickets_count,
    ).update(
        {Event.reserved_seats: Event.reserved_seats - booking.tickets_count},
        synchronize_session=False,
    )
    if released != 1:
        db.session.rollback()
        return jsonify({"error": "Could not release the reserved seats"}), 409

    booking.status = 'cancelled'
    db.session.commit()
    return jsonify(booking.to_dict())
