# Backend Testing Guide

## Testing Framework

### Setup
```bash
# Install testing dependencies
pip install pytest pytest-flask pytest-cov

# Run tests
python -m pytest
python -m pytest tests/ -v
python -m pytest --cov=server tests/
```

## Test Structure
```
tests/
├── conftest.py              # Test configuration
├── test_auth.py            # Authentication tests
├── test_events.py           # Event management tests
├── test_bookings.py        # Booking system tests
├── test_reviews.py         # Review system tests
└── test_models.py          # Model tests
```

## Test Examples

### Authentication Tests
```python
def test_user_registration(client):
    """Test user registration endpoint"""
    user_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    }
    response = client.post('/api/auth/register', json=user_data)
    assert response.status_code == 201
    assert 'user_id' in response.json

def test_user_login(client):
    """Test user login endpoint"""
    login_data = {
        'username': 'testuser',
        'password': 'testpass123'
    }
    response = client.post('/api/auth/login', json=login_data)
    assert response.status_code == 200
    assert 'token' in response.json
```

### Event Tests
```python
def test_create_event(client, auth_headers):
    """Test event creation"""
    event_data = {
        'title': 'Test Event',
        'description': 'Test Description',
        'date': '2024-12-31T10:00:00',
        'location': 'Test Location',
        'price': 25.0,
        'capacity': 100
    }
    response = client.post('/api/events/', 
                         json=event_data, 
                         headers=auth_headers)
    assert response.status_code == 201
    assert response.json['title'] == 'Test Event'

def test_get_events(client):
    """Test get all events"""
    response = client.get('/api/events/')
    assert response.status_code == 200
    assert isinstance(response.json, list)
```

### Model Tests
```python
def test_user_model():
    """Test User model creation"""
    user = User(
        username='testuser',
        email='test@example.com',
        password_hash='hashed_password'
    )
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'

def test_event_model():
    """Test Event model creation"""
    event = Event(
        title='Test Event',
        description='Test Description',
        date=datetime(2024, 12, 31),
        location='Test Location',
        price=25.0,
        capacity=100
    )
    assert event.title == 'Test Event'
    assert event.price == 25.0
```

## Test Configuration

### conftest.py
```python
import pytest
from server.app import create_app
from server import db
from models import User, Event

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    # Register and login user
    user_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    }
    client.post('/api/auth/register', json=user_data)
    response = client.post('/api/auth/login', json=user_data)
    token = response.json['token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def app_ctx(app):
    with app.app_context():
        yield app

@pytest.fixture(autouse=True)
def setup_database(app_ctx):
    db.create_all()
    yield
    db.drop_all()
```

## Running Tests

### Command Line
```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_auth.py

# Run with coverage
python -m pytest --cov=server --cov-report=html

# Run with verbose output
python -m pytest -v

# Run specific test
python -m pytest tests/test_auth.py::test_user_registration -v
```

## Test Coverage

### Coverage Report
```bash
# Generate HTML coverage report
python -m pytest --cov=server --cov-report=html

# Check coverage percentage
python -m pytest --cov=server --cov-report=term-missing
```

### Coverage Goals
- Aim for >80% code coverage
- Focus on critical paths
- Test error conditions
- Cover edge cases

## Integration Tests

### API Integration
```python
def test_full_event_flow(client):
    """Test complete event creation and booking flow"""
    # Create user
    # Create event
    # Book event
    # Add review
    # Verify all steps
```

### Database Integration
```python
def test_database_operations():
    """Test database operations"""
    # Test CRUD operations
    # Test relationships
    # Test constraints
    # Test transactions
```

## Performance Tests

### Load Testing
```python
def test_api_performance(client):
    """Test API response times"""
    import time
    start_time = time.time()
    response = client.get('/api/events/')
    end_time = time.time()
    assert end_time - start_time < 1.0  # < 1 second
    assert response.status_code == 200
```

## Best Practices

### Test Organization
- One assertion per test
- Descriptive test names
- Test setup and teardown
- Mock external dependencies

### Test Data
- Use factory patterns
- Clean up after tests
- Use realistic data
- Test edge cases

### Continuous Integration
- Run tests on every push
- Fail build on test failure
- Generate coverage reports
- Monitor test performance
