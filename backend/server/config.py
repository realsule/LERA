import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

# Get the backend directory (parent of server directory)
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
instance_dir = os.path.join(backend_dir, 'instance')
os.makedirs(instance_dir, exist_ok=True)


def _as_bool(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}


class Config:
    # SQLite for local development, PostgreSQL in production. A relative
    # SQLite path is resolved inside Flask's instance folder by SQLAlchemy.
    db_path = os.path.join(instance_dir, 'lera.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{db_path}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # The backend uses Flask's signed session cookie (see routes/auth.py).
    # Keep it HttpOnly. Set SESSION_COOKIE_SECURE=1 and
    # SESSION_COOKIE_SAMESITE=None when the API and the frontend are served
    # from different sites in production (for example, Netlify + Render).
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
    SESSION_COOKIE_SECURE = _as_bool(os.environ.get('SESSION_COOKIE_SECURE'), False)
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # Comma-separated list of allowed frontend origins. Credentialed CORS
    # cannot use a wildcard.
    FRONTEND_URLS = [
        origin.strip().rstrip('/')
        for origin in os.environ.get(
            'FRONTEND_URLS',
            'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8888'
        ).split(',')
        if origin.strip()
    ]

    # Optional server-side AI reranking. Without a key the deterministic
    # content-based recommender is used. The key is never exposed to the
    # browser and must only be set on the server.
    AI_API_KEY = os.environ.get('AI_API_KEY', '').strip()
    AI_BASE_URL = os.environ.get('AI_BASE_URL', 'https://api.openai.com/v1').rstrip('/')
    AI_MODEL = os.environ.get('AI_MODEL', 'gpt-4o-mini').strip()
    AI_TIMEOUT_SECONDS = float(os.environ.get('AI_TIMEOUT_SECONDS', '8'))
    AI_CACHE_TTL_SECONDS = int(os.environ.get('AI_CACHE_TTL_SECONDS', '300'))
