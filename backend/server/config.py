import os
from dotenv import load_dotenv

load_dotenv()

# Get the backend directory (parent of server directory)
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
instance_dir = os.path.join(backend_dir, 'instance')
os.makedirs(instance_dir, exist_ok=True)

class Config:
<<<<<<< HEAD
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///lera.db'
=======
    # Use SQLite database in instance folder for local development
    # Path: backend/instance/lera.db
    db_path = os.path.join(instance_dir, 'lera.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{db_path}'
>>>>>>> frontend
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'