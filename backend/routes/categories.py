from flask import Blueprint, jsonify

from models import Category

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('/', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify([
        {
            'id': category.id,
            'name': category.name,
            'event_count': len(category.events),
        }
        for category in categories
    ])
