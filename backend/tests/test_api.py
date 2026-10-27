"""Integration tests for the LERA Flask API.

Run from the backend directory with the project virtual environment:

    .venv\\Scripts\\python -m unittest discover -s tests -v

Each test uses an isolated in-memory SQLite database; the development database
is never touched.
"""

import unittest
from datetime import datetime, timedelta

from server.app import create_app
from models import Booking, Category, Event, User, db


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            'TESTING': True,
            'SECRET_KEY': 'test-secret',
            'SQLALCHEMY_DATABASE_URI': 'sqlite://',
            'AI_API_KEY': '',
        })
        self.client = self.app.test_client()

        with self.app.app_context():
            music = Category(name='music')
            conference = Category(name='conference')
            db.session.add_all([music, conference])
            db.session.flush()

            self.organizer = self._user('organizer', 'organizer@example.com', 'organizer')
            self.attendee = self._user('attendee1', 'attendee1@example.com', 'attendee')
            self.other = self._user('attendee2', 'attendee2@example.com', 'attendee')
            self.admin = self._user('admin', 'admin@example.com', 'admin')
            db.session.commit()

            now = datetime.now()
            self.music_event = Event(
                title='Nairobi Jazz Night',
                description='Live jazz from Kenyan artists.',
                date=now + timedelta(days=7),
                location='Alliance Française, Nairobi',
                price=1000,
                capacity=2,
                organizer_id=self.organizer.id,
                category_id=music.id,
            )
            self.conference_event = Event(
                title='Technology Summit',
                description='A conference for software teams.',
                date=now + timedelta(days=30),
                location='KICC, Nairobi',
                price=5000,
                capacity=10,
                organizer_id=self.organizer.id,
                category_id=conference.id,
            )
            self.past_event = Event(
                title='Past Jazz Evening',
                description='Already happened.',
                date=now - timedelta(days=2),
                location='Nairobi',
                price=500,
                capacity=20,
                organizer_id=self.organizer.id,
                category_id=music.id,
            )
            db.session.add_all([self.music_event, self.conference_event, self.past_event])
            db.session.commit()

            self.music_event_id = self.music_event.id
            self.conference_event_id = self.conference_event.id
            self.past_event_id = self.past_event.id

    def _user(self, username, email, role):
        user = User(username=username, email=email, role=role)
        user.set_password('password123')
        db.session.add(user)
        db.session.flush()
        return user

    def login(self, email='attendee1@example.com'):
        return self.client.post(
            '/api/auth/login',
            json={'email': email, 'password': 'password123'},
        )

    def logout(self):
        return self.client.post('/api/auth/logout')

    # Health and discovery -------------------------------------------------

    def test_health_check(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['status'], 'healthy')

    def test_events_pagination_shape(self):
        response = self.client.get('/api/events/?page=1&per_page=1&upcoming=true&sort=date_asc')
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(len(payload['items']), 1)
        self.assertEqual(payload['items'][0]['id'], self.music_event_id)
        self.assertEqual(payload['pagination']['total'], 2)
        self.assertEqual(payload['pagination']['total_pages'], 2)
        self.assertTrue(payload['pagination']['has_next'])

    def test_legacy_unpaginated_response_stays_an_array(self):
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIsInstance(payload, list)
        self.assertEqual(len(payload), 3)

    def test_event_search_and_price_filters(self):
        response = self.client.get('/api/events/?q=jazz&max_price=2000&upcoming=true&page=1')
        payload = response.get_json()
        ids = [item['id'] for item in payload['items']]
        self.assertEqual(ids, [self.music_event_id])

        response = self.client.get('/api/events/?category=conference&upcoming=true&page=1')
        payload = response.get_json()
        self.assertEqual([item['id'] for item in payload['items']], [self.conference_event_id])

    def test_upcoming_filters_and_opt_in_to_past_events(self):
        response = self.client.get('/api/events/?upcoming=false&page=1')
        payload = response.get_json()
        self.assertEqual([item['id'] for item in payload['items']], [self.past_event_id])

        response = self.client.get('/api/events/?upcoming=all&page=1')
        payload = response.get_json()
        self.assertEqual(len(payload['items']), 3)

    def test_invalid_sort_is_rejected(self):
        response = self.client.get('/api/events/?sort=made_up')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid sort option', response.get_json()['error'])

    def test_event_detail_and_missing_event(self):
        response = self.client.get(f'/api/events/{self.music_event_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['title'], 'Nairobi Jazz Night')
        self.assertEqual(response.get_json()['available_tickets'], 2)

        response = self.client.get('/api/events/99999')
        self.assertEqual(response.status_code, 404)

    # Authentication -------------------------------------------------------

    def test_login_me_logout_flow(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/api/auth/me')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['email'], 'attendee1@example.com')

        response = self.logout()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get('/api/auth/me').status_code, 401)

    def test_invalid_credentials_are_rejected(self):
        response = self.client.post(
            '/api/auth/login',
            json={'email': 'attendee1@example.com', 'password': 'wrong-password'},
        )
        self.assertEqual(response.status_code, 401)

    def test_registration_rejects_admin_self_signup(self):
        response = self.client.post('/api/auth/register', json={
            'username': 'newadmin',
            'email': 'newadmin@example.com',
            'password': 'password123',
            'role': 'admin',
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('attendee or organizer', response.get_json()['error'])

    def test_registration_creates_attendee_session(self):
        response = self.client.post('/api/auth/register', json={
            'username': 'newattendee',
            'email': 'newattendee@example.com',
            'password': 'password123',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()['role'], 'attendee')
        self.assertEqual(self.client.get('/api/auth/me').status_code, 200)

    # Bookings and capacity ------------------------------------------------

    def test_booking_requires_authentication(self):
        response = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 1,
        })
        self.assertEqual(response.status_code, 401)

    def test_booking_uses_server_price_and_reserves_capacity(self):
        self.login()
        response = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 2,
            'total_price': 1,
        })
        self.assertEqual(response.status_code, 201)
        booking = response.get_json()
        self.assertEqual(booking['total_price'], 2000)
        self.assertEqual(booking['status'], 'pending')
        self.assertRegex(booking['reference'], r'^LERA-\d{6}$')

        event = self.client.get(f'/api/events/{self.music_event_id}').get_json()
        self.assertEqual(event['reserved_seats'], 2)
        self.assertEqual(event['available_tickets'], 0)

    def test_booking_cannot_oversell(self):
        self.login()
        response = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 3,
        })
        self.assertEqual(response.status_code, 409)
        self.assertIn('Only 2 ticket(s) remain', response.get_json()['error'])

        self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 2,
        })
        response = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 1,
        })
        self.assertEqual(response.status_code, 409)

    def test_past_event_cannot_be_booked(self):
        self.login()
        response = self.client.post('/api/bookings/', json={
            'event_id': self.past_event_id,
            'tickets_count': 1,
        })
        self.assertEqual(response.status_code, 409)
        self.assertIn('already taken place', response.get_json()['error'])

    def test_cancellation_releases_seats_once(self):
        self.login()
        created = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 1,
        }).get_json()

        response = self.client.delete(f"/api/bookings/{created['id']}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['status'], 'cancelled')

        event = self.client.get(f'/api/events/{self.music_event_id}').get_json()
        self.assertEqual(event['reserved_seats'], 0)
        self.assertEqual(event['available_tickets'], 2)

        # Cancelling twice must not release the same seat twice.
        response = self.client.delete(f"/api/bookings/{created['id']}")
        self.assertEqual(response.status_code, 200)
        event = self.client.get(f'/api/events/{self.music_event_id}').get_json()
        self.assertEqual(event['reserved_seats'], 0)

    def test_other_attendee_cannot_view_or_cancel_booking(self):
        self.login()
        created = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 1,
        }).get_json()
        self.logout()

        self.login('attendee2@example.com')
        self.assertEqual(self.client.get(f"/api/bookings/{created['id']}").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/bookings/{created['id']}").status_code, 403)
        event = self.client.get(f'/api/events/{self.music_event_id}').get_json()
        self.assertEqual(event['reserved_seats'], 1)

    def test_payment_confirms_booking_without_card_processor(self):
        self.login()
        created = self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 1,
        }).get_json()

        response = self.client.post('/api/payments/process', json={'booking_id': created['id']})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['booking']['status'], 'confirmed')

        response = self.client.post('/api/payments/process', json={'booking_id': 99999})
        self.assertEqual(response.status_code, 404)

    # Organizer authorisation ---------------------------------------------

    def test_attendee_cannot_create_event(self):
        self.login()
        response = self.client.post('/api/events/', json={
            'title': 'Unauthorised event',
            'date': (datetime.now() + timedelta(days=10)).isoformat(),
            'location': 'Nairobi',
            'capacity': 10,
        })
        self.assertEqual(response.status_code, 403)

    def test_organizer_can_create_event(self):
        self.login('organizer@example.com')
        response = self.client.post('/api/events/', json={
            'title': 'New Workshop',
            'description': 'A practical workshop.',
            'date': (datetime.now() + timedelta(days=10)).isoformat(),
            'location': 'Nairobi',
            'price': 750,
            'capacity': 25,
        })
        self.assertEqual(response.status_code, 201)
        payload = response.get_json()
        self.assertEqual(payload['title'], 'New Workshop')
        self.assertEqual(payload['available_tickets'], 25)

    def test_capacity_cannot_drop_below_reserved_seats(self):
        self.login()
        self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 2,
        })
        self.logout()

        self.login('organizer@example.com')
        response = self.client.put(f'/api/events/{self.music_event_id}', json={
            'capacity': 1,
        })
        self.assertEqual(response.status_code, 409)
        self.assertIn('Capacity cannot be lower', response.get_json()['error'])

        response = self.client.put(f'/api/events/{self.music_event_id}', json={
            'capacity': 2,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['capacity'], 2)

    # Recommendations ------------------------------------------------------

    def test_recommendations_use_available_future_events(self):
        response = self.client.get('/api/recommendations?interests=music&limit=5')
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()

        self.assertEqual(payload['strategy'], 'content_based')
        self.assertFalse(payload['ai_configured'])
        ids = [item['event_id'] for item in payload['items']]
        self.assertIn(self.music_event_id, ids)
        self.assertIn(self.conference_event_id, ids)
        self.assertNotIn(self.past_event_id, ids)
        self.assertEqual(payload['items'][0]['event_id'], self.music_event_id)
        self.assertIn('Matches your interest in music', payload['items'][0]['reason'])

    def test_recommendations_exclude_seed_and_booked_events(self):
        self.login()
        self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 1,
        })
        self.logout()

        response = self.client.get(
            f'/api/recommendations?interests=music&event_id={self.music_event_id}'
        )
        ids = [item['event_id'] for item in response.get_json()['items']]
        self.assertNotIn(self.music_event_id, ids)

    def test_recommendations_exclude_sold_out_events(self):
        self.login()
        self.client.post('/api/bookings/', json={
            'event_id': self.music_event_id,
            'tickets_count': 2,
        })
        self.logout()

        response = self.client.get('/api/recommendations?interests=music')
        ids = [item['event_id'] for item in response.get_json()['items']]
        self.assertNotIn(self.music_event_id, ids)

    def test_recommendations_reject_invalid_parameters(self):
        self.assertEqual(self.client.get('/api/recommendations?budget=-1').status_code, 400)
        self.assertEqual(self.client.get('/api/recommendations?limit=abc').status_code, 400)
        self.assertEqual(self.client.get('/api/recommendations?event_id=99999').status_code, 404)


if __name__ == '__main__':
    unittest.main()
