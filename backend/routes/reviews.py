from flask import Blueprint, jsonify, request

from models import Event, Review, db
from routes.auth import get_current_user, login_required

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/', methods=['POST'])
@login_required
def create_review():
    data = request.get_json(silent=True) or {}
    user = get_current_user()

    try:
        event_id = int(data.get('event_id'))
        rating = int(data.get('rating'))
    except (TypeError, ValueError):
        return jsonify({"error": "event_id and rating must be integers"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    if not Event.query.get(event_id):
        return jsonify({"error": "Event not found"}), 404
    if Review.query.filter_by(user_id=user.id, event_id=event_id).first():
        return jsonify({"error": "You have already reviewed this event"}), 409

    review = Review(
        user_id=user.id,
        event_id=event_id,
        rating=rating,
        comment=str(data.get('comment', '')).strip()[:2000],
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201


@reviews_bp.route('/event/<int:event_id>', methods=['GET'])
def get_event_reviews(event_id):
    if not Event.query.get(event_id):
        return jsonify({"error": "Event not found"}), 404
    reviews = Review.query.filter_by(event_id=event_id).order_by(Review.created_at.desc()).all()
    return jsonify([review.to_dict() for review in reviews])
