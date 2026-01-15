import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Filter, AlertCircle } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import { eventsAPI } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Transform backend event data to match EventCard component expectations
  const transformEventData = (backendEvent) => {
    if (!backendEvent) return null;
    
    try {
      const eventDate = backendEvent.date ? new Date(backendEvent.date) : new Date();
      return {
        id: backendEvent.id || null,
        title: backendEvent.title || 'Untitled Event',
        description: backendEvent.description || 'No description available.',
        category: backendEvent.category?.name?.toLowerCase() || 'other',
        date: backendEvent.date || new Date().toISOString(),
        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: backendEvent.location || 'Venue TBA',
        ticketTypes: [
          { 
            name: 'General Admission', 
            price: backendEvent.price || 0, 
            quantity: Math.floor((backendEvent.capacity || 0) * 0.8) 
          }
        ],
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop',
        organizer: { 
          firstName: backendEvent.organizer?.username?.split(' ')[0] || 'Event', 
          lastName: backendEvent.organizer?.username?.split(' ')[1] || 'Organizer' 
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

  // Fetch events from backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await eventsAPI.getAll().catch((err) => {
          if (!err.response) {
            throw new Error('Server is under maintenance. Please try again later.');
          }
          throw err;
        });
        
        const backendEvents = response.data || [];
        
        // Transform backend data to match frontend component expectations
        const transformedEvents = backendEvents
          .map(transformEventData)
          .filter(event => event !== null);
        
        setEvents(transformedEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err.message || 'Failed to load events. Please try again later.');
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

  // Get unique categories from events
  const categories = ['all', ...new Set(events.map(e => e?.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Explore Events</h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover amazing events happening near you
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search events, venues, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 text-gray-900 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
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

          {/* Empty State */}
          {!loading && !error && filteredEvents.length === 0 && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events available at the moment.</p>
              <p className="text-gray-400 mt-2">Check back later for new events!</p>
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && filteredEvents.length === 0 && events.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && filteredEvents.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  event && event.id ? (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ) : null
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
