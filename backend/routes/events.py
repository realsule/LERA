from flask import Blueprint, request, jsonify, session
from datetime import datetime
from models import db, Event
from routes.auth import login_required

events_bp = Blueprint('events', __name__)

# GET all events
@events_bp.route('/', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events])

# GET single event
@events_bp.route('/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get_or_404(id)
    return jsonify(event.to_dict())

# CREATE event
@events_bp.route('/', methods=['POST'])
@login_required
def create_event():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('title') or not data.get('location') or not data.get('date'):
        return jsonify({"error": "Missing required fields: title, location, date"}), 400
    
    # Parse date
    date_str = data['date']
    try:
        if 'T' in date_str:
            event_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            event_date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS"}), 400
    
    # Create event
    event = Event(
        title=data['title'],
        description=data.get('description', ''),
        date=event_date,
        location=data['location'],
        price=float(data.get('price', 0)),
        capacity=int(data.get('capacity', 100)),
        organizer_id=session['user_id'],
        category_id=data.get('category_id')
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify(event.to_dict()), 201

# UPDATE event
@events_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_event(id):
    event = Event.query.get_or_404(id)
    
    # Check authorization
    if event.organizer_id != session['user_id']:
        from models import User
        user = User.query.get(session['user_id'])
        if not user or not user.is_admin():
            return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    # Update fields if provided
    if 'title' in data:
        event.title = data['title']
    if 'description' in data:
        event.description = data['description']
    if 'location' in data:
        event.location = data['location']
    if 'price' in data:
        event.price = float(data['price'])
    if 'capacity' in data:
        event.capacity = int(data['capacity'])
    if 'category_id' in data:
        event.category_id = data['category_id']
    if 'date' in data:
        try:
            date_str = data['date']
            if 'T' in date_str:
                event.date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                event.date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
    
    db.session.commit()
    return jsonify(event.to_dict())

# DELETE event
@events_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_event(id):
    event = Event.query.get_or_404(id)
    
    # Check authorization
    if event.organizer_id != session['user_id']:
        from models import User
        user = User.query.get(session['user_id'])
        if not user or not user.is_admin():
            return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully"})