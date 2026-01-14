from flask import Blueprint, jsonify, session
from models import db, Event, User
from routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/events/pending', methods=['GET'])
@admin_required
def get_pending_events():
    # Example: Events needing approval
    events = Event.query.filter_by(status='pending').all()  # Add status field if needed
    return jsonify([e.to_dict() for e in events])

@admin_bp.route('/events/<int:id>/approve', methods=['POST'])
@admin_required
def approve_event(id):
    event = Event.query.get_or_404(id)
    # Add approval logic
    return jsonify({"message": "Event approved"})