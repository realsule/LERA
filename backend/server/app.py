from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from models import db
from config import Config

# Import blueprints
from routes.auth import auth_bp
from routes.events import events_bp
from routes.bookings import bookings_bp
from routes.reviews import reviews_bp
from routes.categories import categories_bp
from routes.payments import payments_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app, supports_credentials=True)
    
    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    
    # CREATE TABLES ON STARTUP
    with app.app_context():
        db.create_all()
        print("✅ Database tables created/verified")
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Health check route
    @app.route('/')
    def home():
        return jsonify({"message": "LERA API is running"})
    
    @app.route('/api/health')
    def health():
        return jsonify({"status": "healthy"})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=5000, debug=True)