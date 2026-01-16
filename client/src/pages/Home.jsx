import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Ticket, TrendingUp, AlertCircle } from 'lucide-react';
import EventCard from "../components/events/EventCard";
import { eventsAPI } from '../services/api';

// Constants for better maintainability
const CATEGORIES = [
  { label: 'All Events', value: 'all' },
  { label: 'Concerts', value: 'concert' },
  { label: 'Conferences', value: 'conference' },
  { label: 'Sports', value: 'sports' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Parties', value: 'party' }
];


const Home = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform backend event data to match EventCard component expectations
  // Backend returns: { id, title, description, date (ISO string), location, price, capacity, organizer_id, category_id }
  const transformEventData = (backendEvent) => {
    if (!backendEvent) return null;
    
    try {
      // Parse the ISO date string from backend
      const eventDate = backendEvent.date ? new Date(backendEvent.date) : new Date();
      
      // Map event titles to high-quality Unsplash images
      const getEventImage = (title) => {
        if (title.toLowerCase().includes('music') || title.toLowerCase().includes('festival')) {
          return 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1000&auto=format&fit=crop';
        }
        if (title.toLowerCase().includes('tech') || title.toLowerCase().includes('innovation') || title.toLowerCase().includes('summit')) {
          return 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?q=80&w=1000&auto=format&fit=crop';
        }
        if (title.toLowerCase().includes('marathon') || title.toLowerCase().includes('championship') || title.toLowerCase().includes('sports')) {
          return 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop';
        }
        // Default image for other events
        return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop';
      };
      
      return {
        id: backendEvent.id || null,
        title: backendEvent.title || 'Untitled Event',
        description: backendEvent.description || 'No description available.',
        // Backend only provides category_id, not category object, so we'll use a default
        category: 'other', // Will be enhanced if backend includes category name
        date: backendEvent.date || new Date().toISOString(),
        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: backendEvent.location || 'Venue TBA', // Backend uses 'location' not 'venue'
        image: getEventImage(backendEvent.title), // Add high-quality image based on title
        ticketTypes: [ 
          { 
            name: 'General Admission', 
            price: backendEvent.price || 0, 
            quantity: Math.floor((backendEvent.capacity || 0) * 0.8) 
          }
        ],
        // Backend only provides organizer_id, not organizer object
        organizer: { 
          firstName: 'Event', 
          lastName: 'Organizer' 
        },
        totalTickets: backendEvent.capacity || 0,
        availableTickets: Math.floor((backendEvent.capacity || 0) * 0.8),
        rating: 4.5,
        reviews: 0,
        tags: []
      };
    } catch (error) {
      console.error('Error transforming event data:', error);
      return null;
    }
  };

  // Fetch events from backend on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching events from backend...');
        
        const response = await eventsAPI.getAll().catch((err) => {
          console.error('❌ API Error:', err);
          if (!err.response) {
            throw new Error('Server is under maintenance. Please try again later.');
          }
          throw err;
        });
        
        // Backend returns an array directly in response.data
        const backendEvents = Array.isArray(response.data) ? response.data : [];
        
        console.log('✅ Events received in Frontend:', backendEvents);
        console.log('✅ Number of events:', backendEvents.length);
        console.log('✅ First event structure:', backendEvents[0] || 'No events');
        
        // If no events, log a warning
        if (backendEvents.length === 0) {
          console.warn('⚠️ No events returned from backend. Database might be empty or backend needs restart.');
        }
        
        // Transform backend data to match frontend component expectations
        const transformedEvents = backendEvents
          .map(transformEventData)
          .filter(event => event !== null); // Filter out any null transformations
        
        console.log('✅ Transformed events:', transformedEvents);
        setEvents(transformedEvents);
      } catch (err) {
        console.error('❌ Failed to fetch events:', err);
        
        // Check if server is offline
        if (!err.response) {
          setError('Server is under maintenance. Please try again later.');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to load events. Please try again later.');
        }
        
        // Fallback to empty array on error
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Filter events with null checks
  const filteredEvents = events.filter(event => {
    if (!event || !event.title) return false;
    
    const matchesSearch = searchQuery.trim() === '' || 
      (event.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (event.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (typeof event.venue === 'string' ? event.venue.toLowerCase() : '').includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchInputValue(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-700 text-white" data-testid="hero-section">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6" data-testid="hero-title">
              Discover Amazing Events Near You
            </h1>
            <p className="text-xl mb-8 text-blue-100" data-testid="hero-description">
              Find and book tickets for concerts, conferences, sports, and more. Your next unforgettable experience is just a click away.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-2" data-testid="search-bar">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search events, artists, venues..."
                  value={searchInputValue}
                  onChange={handleSearchChange}
                  className="w-full py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                  data-testid="search-input"
                  aria-label="Search events"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="px-4 py-3 text-gray-900 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="category-select"
                aria-label="Filter by category"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button
                className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
                data-testid="search-button"
                aria-label="Search events"
              >
                Search Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12" data-testid="events-section">
        <div className="container mx-auto px-4">
          {/* Featured Events */}
          <div className="mb-12" data-testid="featured-events">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-gray-600 mb-8">Explore our handpicked selection of amazing events</p>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12" data-testid="loading-events">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200" data-testid="error-events">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-800 text-lg font-medium mb-2">Failed to load events</p>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State (no events found after filtering) */}
            {!loading && !error && filteredEvents.length === 0 && events.length > 0 && (
              <div className="text-center py-12" data-testid="no-events-filtered">
                <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
                <button
                  onClick={() => {
                    setSearchInputValue('');
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  data-testid="clear-filters-button"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Empty State (no events in database) */}
            {!loading && !error && events.length === 0 && (
              <div className="text-center py-12" data-testid="no-events">
                <p className="text-gray-500 text-lg">No events available at the moment.</p>
                <p className="text-gray-400 mt-2">Check back later for new events!</p>
              </div>
            )}

            {/* Events Grid */}
            {!loading && !error && filteredEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="events-grid">
                {filteredEvents.map(event => (
                  event && event.id ? (
                    <EventCard
                      key={event.id}
                      event={event}
                      data-testid="event-card"
                    />
                  ) : null
                ))}
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div className="mb-12" data-testid="categories-section">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600 mb-8">Find events that match your interests</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.filter(cat => cat.value !== 'all').map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-4 rounded-lg border transition-colors duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  aria-label={`Filter by ${category.label}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12" data-testid="statistics">
            <div className="text-center animate-fade-in">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Events Listed</h3>
                <p className="text-2xl font-bold text-purple-600 animate-pop">1,200+</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-2xl font-bold text-green-600 animate-pop">50K+</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
                <p className="text-2xl font-bold text-yellow-500 animate-pop">4.8</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Satisfaction</h3>
                <p className="text-2xl font-bold text-purple-600 animate-pop">98%</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16" data-testid="cta-section">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Host Your Own Event?</h2>
                <p className="text-xl mb-8">Join thousands of event organizers who trust our platform</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/events/create"
                    className="px-8 py-3 bg-white text-purple-600 rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
                    aria-label="Create new event"
                  >
                    Get Started Today
                  </Link>
                  <Link
                    to="/events/create"
                    className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-purple-600 transition-colors duration-200 font-medium"
                    aria-label="Learn more"
                  >
                    Browse All Events
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Home;