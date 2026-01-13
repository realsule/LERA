from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db, bcrypt
from models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Username, email, and password required'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username taken'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'attendee')
        )
        
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        
        return jsonify({
            'message': 'Account created!',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'role': new_user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        login_user(user, remember=data.get('remember', False))
        
        return jsonify({
            'message': 'Logged in!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'role': current_user.role
        }), 200
    else:
        return jsonify({'user': None}), 200

@auth_bp.route('/me', methods=['PATCH'])
@login_required
def update_profile():
    try:
        data = request.get_json()
        
        if 'email' in data:
            existing = User.query.filter(
                User.email == data['email'],
                User.id != current_user.id
            ).first()
            if existing:
                return jsonify({'error': 'Email already in use'}), 409
            current_user.email = data['email']
        
        if 'username' in data:
            existing = User.query.filter(
                User.username == data['username'],
                User.id != current_user.id
            ).first()
            if existing:
                return jsonify({'error': 'Username already taken'}), 409
            current_user.username = data['username']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated',
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'role': current_user.role
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500