from flask import Blueprint, request, jsonify, session
from models import db, Booking
from routes.auth import login_required

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/process', methods=['POST'])
@login_required
def process_payment():
    data = request.get_json()
    booking_id = data.get('booking_id')
    
    booking = Booking.query.get_or_404(booking_id)
    
    # Mock payment processing
    booking.status = 'confirmed'
    db.session.commit()
    
    return jsonify({
        "message": "Payment successful",
        "booking": booking.to_dict()
    })