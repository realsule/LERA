import os
import sys

# Add backend directory to Python path for imports
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy import inspect, text
from werkzeug.exceptions import HTTPException

from models import db
from server.config import Config

# Import blueprints
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.bookings import bookings_bp
from routes.categories import categories_bp
from routes.events import events_bp
from routes.payments import payments_bp
from routes.recommendations import recommendations_bp
from routes.reviews import reviews_bp


def _ensure_event_columns():
    """Apply the small additive schema changes used by this version.

    The project creates tables with ``db.create_all()`` instead of relying on
    an existing Alembic history. This idempotent check lets an existing
    development database keep its data while gaining the columns required for
    safe capacity handling and optional event images.
    """
    inspector = inspect(db.engine)
    if 'events' not in inspector.get_table_names():
        return

    existing = {column['name'] for column in inspector.get_columns('events')}
    statements = []
    if 'reserved_seats' not in existing:
        statements.append(
            'ALTER TABLE events ADD COLUMN reserved_seats INTEGER NOT NULL DEFAULT 0'
        )
    if 'image_url' not in existing:
        statements.append('ALTER TABLE events ADD COLUMN image_url VARCHAR(500)')

    for statement in statements:
        db.session.execute(text(statement))
    if statements:
        db.session.commit()


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)

    # Credentialed requests are required because authentication is stored in
    # Flask's HttpOnly session cookie rather than a browser-readable JWT.
    CORS(
        app,
        origins=app.config.get('FRONTEND_URLS') or ['http://localhost:5173'],
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    )

    db.init_app(app)
    Migrate(app, db)

    with app.app_context():
        db.create_all()
        _ensure_event_columns()
        print("Database tables created/verified")

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')

    # Health check routes
    @app.route('/')
    def home():
        return jsonify({"message": "LERA API is running"})

    @app.route('/api/health')
    def health():
        return jsonify({"status": "healthy"})

    @app.after_request
    def add_security_headers(response):
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        return response

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        if request.path.startswith('/api'):
            return jsonify({"error": error.description, "status": error.code}), error.code
        return error

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        db.session.rollback()
        if app.config.get('TESTING') or app.config.get('PROPAGATE_EXCEPTIONS'):
            raise error
        app.logger.exception('Unhandled API error')
        if request.path.startswith('/api'):
            return jsonify({"error": "Internal server error", "status": 500}), 500
        return error

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5555))
    app.run(host='0.0.0.0', port=port, debug=False)
