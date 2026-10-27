from flask import Blueprint, jsonify, request

from models import Booking, db
from routes.auth import get_current_user, login_required

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/process', methods=['POST'])
@login_required
def process_payment():
    data = request.get_json(silent=True) or {}
    try:
        booking_id = int(data.get('booking_id'))
    except (TypeError, ValueError):
        return jsonify({"error": "booking_id must be an integer"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    user = get_current_user()
    if booking.user_id != user.id and not user.is_admin():
        return jsonify({"error": "You cannot pay for this booking"}), 403
    if booking.status == 'cancelled':
        return jsonify({"error": "Cancelled bookings cannot be paid"}), 409

    # This project has no payment-provider integration. Marking a booking as
    # confirmed here is the existing backend contract, not a real card charge.
    booking.status = 'confirmed'
    db.session.commit()

    return jsonify({
        "message": "Booking confirmed",
        "booking": booking.to_dict(),
    })
