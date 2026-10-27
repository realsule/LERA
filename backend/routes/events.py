from datetime import datetime

from flask import Blueprint, jsonify, request, session
from sqlalchemy import func, or_

from models import Category, Event, User, db
from routes.auth import get_current_user, login_required, organizer_required

events_bp = Blueprint('events', __name__)

SORT_OPTIONS = {
    'date_asc': (Event.date.asc(),),
    'date_desc': (Event.date.desc(),),
    'price_asc': (Event.price.asc(), Event.date.asc()),
    'price_desc': (Event.price.desc(), Event.date.asc()),
    'title_asc': (func.lower(Event.title).asc(),),
    'newest': (Event.created_at.desc(),),
    'popular': (Event.reserved_seats.desc(), Event.date.asc()),
}
MAX_PER_PAGE = 100


def _parse_float(value, field):
    try:
        return float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be a number")


def _parse_int(value, field):
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be an integer")


def _parse_date(value, field):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
        if parsed.tzinfo:
            parsed = parsed.astimezone().replace(tzinfo=None)
        return parsed
    except ValueError:
        raise ValueError(f"{field} must be a valid ISO date")


def _parse_event_date(value):
    if not value:
        raise ValueError('Date is required')
    return _parse_date(value, 'date')


def _event_query():
    return Event.query


def _apply_filters(query):
    args = request.args
    search = (args.get('q') or '').strip()
    if search:
        if len(search) > 100:
            raise ValueError('Search query is too long')
        term = f"%{search}%"
        query = query.filter(
            or_(
                Event.title.ilike(term),
                Event.description.ilike(term),
                Event.location.ilike(term),
            )
        )

    category = (args.get('category') or '').strip()
    if category and category.lower() != 'all':
        if category.isdigit():
            query = query.filter(Event.category_id == int(category))
        else:
            matched = Category.query.filter(func.lower(Category.name) == category.lower()).first()
            if not matched:
                # An unknown category should produce an empty result rather
                # than silently returning every event.
                query = query.filter(Event.id == -1)
            else:
                query = query.filter(Event.category_id == matched.id)

    if args.get('min_price') not in (None, ''):
        query = query.filter(Event.price >= _parse_float(args.get('min_price'), 'min_price'))
    if args.get('max_price') not in (None, ''):
        query = query.filter(Event.price <= _parse_float(args.get('max_price'), 'max_price'))

    date_from = _parse_date(args.get('date_from'), 'date_from')
    date_to = _parse_date(args.get('date_to'), 'date_to')
    if date_from:
        query = query.filter(Event.date >= date_from)
    if date_to:
        query = query.filter(Event.date <= date_to)

    upcoming = (args.get('upcoming') or '').strip().lower()
    if upcoming in {'1', 'true', 'yes'}:
        query = query.filter(Event.date > datetime.now())
    elif upcoming in {'0', 'false', 'no'}:
        query = query.filter(Event.date <= datetime.now())
    # "all" (or "any") deliberately applies neither date filter. The discovery
    # UI uses it when a visitor opts into seeing past events as well.

    if (args.get('available') or '').strip().lower() in {'1', 'true', 'yes'}:
        query = query.filter(Event.reserved_seats < Event.capacity)

    return query


@events_bp.route('/', methods=['GET'])
def get_events():
    args = request.args
    paginated = any(key in args for key in ('page', 'per_page', 'paginate'))
    page = max(_parse_int_or_default(args.get('page'), 1), 1)
    per_page = min(max(_parse_int_or_default(args.get('per_page'), 12), 1), MAX_PER_PAGE)
    sort = args.get('sort') or 'date_asc'
    if sort not in SORT_OPTIONS:
        return jsonify({"error": f"Invalid sort option. Use one of: {', '.join(SORT_OPTIONS)}"}), 400

    try:
        query = _apply_filters(_event_query())
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    total = query.order_by(None).count()
    query = query.order_by(*SORT_OPTIONS[sort])

    if not paginated:
        return jsonify([event.to_dict() for event in query.all()])

    events = query.offset((page - 1) * per_page).limit(per_page).all()
    total_pages = max((total + per_page - 1) // per_page, 1)
    return jsonify({
        'items': [event.to_dict() for event in events],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1,
        },
        'filters': {
            'q': args.get('q', ''),
            'category': args.get('category', ''),
            'min_price': args.get('min_price', ''),
            'max_price': args.get('max_price', ''),
            'date_from': args.get('date_from', ''),
            'date_to': args.get('date_to', ''),
            'sort': sort,
            'upcoming': args.get('upcoming', ''),
        },
    })


def _parse_int_or_default(value, default):
    if value in (None, ''):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


@events_bp.route('/my-events', methods=['GET'])
@login_required
def get_my_events():
    user = get_current_user()
    query = Event.query
    if user.role == 'admin' and request.args.get('all') in {'1', 'true'}:
        pass
    else:
        query = query.filter(Event.organizer_id == user.id)
    events = query.order_by(Event.date.asc()).all()
    return jsonify([event.to_dict() for event in events])


@events_bp.route('/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.to_dict())


def _validated_event_payload(data, partial=False):
    errors = {}

    title = data.get('title')
    if title is not None:
        title = str(title).strip()
        if not title:
            errors['title'] = 'Title is required'
        elif len(title) > 200:
            errors['title'] = 'Title cannot exceed 200 characters'

    location = data.get('location')
    if location is not None:
        location = str(location).strip()
        if not location:
            errors['location'] = 'Location is required'
        elif len(location) > 200:
            errors['location'] = 'Location cannot exceed 200 characters'

    description = data.get('description')
    if description is not None:
        description = str(description).strip()
        if len(description) > 10000:
            errors['description'] = 'Description is too long'

    image_url = data.get('image_url')
    if image_url is not None:
        image_url = str(image_url).strip()
        if image_url and len(image_url) > 500:
            errors['image_url'] = 'Image URL cannot exceed 500 characters'

    price = data.get('price')
    if price is not None:
        try:
            price = float(price)
            if price < 0:
                errors['price'] = 'Price cannot be negative'
        except (TypeError, ValueError):
            errors['price'] = 'Price must be a number'

    capacity = data.get('capacity')
    if capacity is not None:
        try:
            capacity = int(capacity)
            if capacity < 1:
                errors['capacity'] = 'Capacity must be at least 1'
        except (TypeError, ValueError):
            errors['capacity'] = 'Capacity must be an integer'

    category_id = data.get('category_id')
    if category_id not in (None, ''):
        try:
            category_id = int(category_id)
        except (TypeError, ValueError):
            errors['category_id'] = 'Category must be an integer'
        else:
            if not Category.query.get(category_id):
                errors['category_id'] = 'Category not found'
    else:
        category_id = None

    event_date = None
    if data.get('date') not in (None, ''):
        try:
            event_date = _parse_event_date(data.get('date'))
        except ValueError as error:
            errors['date'] = str(error)
    elif not partial:
        errors['date'] = 'Date is required'

    if not partial:
        if not data.get('title'):
            errors['title'] = 'Title is required'
        if not data.get('location'):
            errors['location'] = 'Location is required'
        if data.get('price') is None:
            price = 0.0
        if data.get('capacity') is None:
            errors['capacity'] = 'Capacity is required'

    if errors:
        return None, errors

    return {
        'title': title,
        'location': location,
        'description': description,
        'image_url': image_url,
        'price': price,
        'capacity': capacity,
        'category_id': category_id,
        'date': event_date,
    }, None


@events_bp.route('/', methods=['POST'])
@organizer_required
def create_event():
    data = request.get_json(silent=True) or {}
    payload, errors = _validated_event_payload(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    event = Event(
        title=payload['title'],
        description=payload['description'] or '',
        date=payload['date'],
        location=payload['location'],
        price=payload['price'],
        capacity=payload['capacity'],
        image_url=payload['image_url'] or None,
        organizer_id=session['user_id'],
        category_id=payload['category_id'],
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


def _can_manage_event(event, user):
    return bool(user and (event.organizer_id == user.id or user.is_admin()))


@events_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    user = get_current_user()
    if not _can_manage_event(event, user):
        return jsonify({"error": "You cannot manage this event"}), 403

    data = request.get_json(silent=True) or {}
    payload, errors = _validated_event_payload(data, partial=True)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    if payload['capacity'] is not None and payload['capacity'] < event.reserved_seats:
        return jsonify({
            "error": f"Capacity cannot be lower than the {event.reserved_seats} seats already booked"
        }), 409

    for field in ('title', 'description', 'location', 'image_url', 'price', 'capacity', 'category_id', 'date'):
        value = payload.get(field)
        if value is not None:
            setattr(event, field, value)
    if payload.get('image_url') == '':
        event.image_url = None

    db.session.commit()
    return jsonify(event.to_dict())


@events_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    user = get_current_user()
    if not _can_manage_event(event, user):
        return jsonify({"error": "You cannot manage this event"}), 403

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully"})
