from server.app import create_app
from models import db

app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
    print("Tables created!")
    
    # Check
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print("Existing tables:", tables)
