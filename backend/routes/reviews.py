from flask import Blueprint, request, jsonify, session
from models import db, Review
from routes.auth import login_required

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['POST'])
@login_required
def create_review():
    data = request.get_json()
    
    review = Review(
        user_id=session['user_id'],
        event_id=data['event_id'],
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201

@reviews_bp.route('/event/<int:event_id>', methods=['GET'])
def get_event_reviews(event_id):
    reviews = Review.query.filter_by(event_id=event_id).all()
    return jsonify([r.to_dict() for r in reviews])