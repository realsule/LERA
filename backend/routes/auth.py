from functools import wraps

from flask import Blueprint, jsonify, request, session

from models import User, db

auth_bp = Blueprint('auth', __name__)

VALID_SELF_SERVICE_ROLES = {'attendee', 'organizer'}


def get_current_user():
    user_id = session.get('user_id')
    return User.query.get(user_id) if user_id else None


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Authentication required"}), 401
        if not get_current_user():
            session.clear()
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated


def organizer_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        if user.role not in {'organizer', 'admin'}:
            return jsonify({"error": "Organizer access required"}), 403
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        if not user.is_admin():
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    role = str(data.get('role', 'attendee')).strip().lower()

    if not username or not email or not password:
        return jsonify({"error": "Username, email and password are required"}), 400
    if len(username) < 3 or len(username) > 80:
        return jsonify({"error": "Username must be between 3 and 80 characters"}), 400
    if '@' not in email or len(email) > 120:
        return jsonify({"error": "A valid email address is required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if role not in VALID_SELF_SERVICE_ROLES:
        return jsonify({"error": "Role must be either attendee or organizer"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    session.clear()
    session['user_id'] = user.id
    session.permanent = True
    return jsonify(user.to_dict()), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get('email') or data.get('username') or '').strip().lower()
    password = str(data.get('password', ''))

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    session.clear()
    session['user_id'] = user.id
    session.permanent = True
    return jsonify(user.to_dict())


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user_route():
    return jsonify(get_current_user().to_dict())
