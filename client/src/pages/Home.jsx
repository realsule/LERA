import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Ticket, TrendingUp } from 'lucide-react';
import EventCard from "../components/events/EventCard";

// Constants for better maintainability
const CATEGORIES = [
  { label: 'All Events', value: 'all' },
  { label: 'Concerts', value: 'concert' },
  { label: 'Conferences', value: 'conference' },
  { label: 'Sports', value: 'sports' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Parties', value: 'party' }
];

// Mock events data
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Summer Music Festival 2024',
    description: 'Experience the best of live music with top artists from around the world.',
    category: 'concert',
    date: '2024-07-15',
    time: '18:00',
    venue: 'Central Park Arena',
    ticketTypes: [
      { name: 'General Admission', price: 75, quantity: 500 },
      { name: 'VIP Pass', price: 150, quantity: 100 }
    ],
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop',
    organizer: { firstName: 'John', lastName: 'Doe' },
    totalTickets: 600,
    availableTickets: 450,
    rating: 4.5,
    reviews: 128,
    tags: ['music', 'festival', 'outdoor']
  },
  {
    id: '2',
    title: 'Tech Innovation Summit',
    description: 'Join industry leaders for a deep dive into the latest technology trends.',
    category: 'conference',
    date: '2024-08-20',
    time: '09:00',
    venue: 'Convention Center',
    ticketTypes: [
      { name: 'Standard', price: 299, quantity: 200 },
      { name: 'Premium', price: 599, quantity: 50 }
    ],
    image: 'https://images.unsplash.com/photo-1540575167028-0e7a0b6b5b1a?w=400&h=250&fit=crop',
    organizer: { firstName: 'Jane', lastName: 'Smith' },
    totalTickets: 250,
    availableTickets: 180,
    rating: 4.8,
    reviews: 95,
    tags: ['tech', 'innovation', 'networking']
  },
  {
    id: '3',
    title: 'Marathon Championship',
    description: 'Challenge yourself in this exciting marathon event for all fitness levels.',
    category: 'sports',
    date: '2024-09-10',
    time: '07:00',
    venue: 'City Stadium',
    ticketTypes: [
      { name: 'Participant', price: 50, quantity: 1000 },
      { name: 'VIP Package', price: 120, quantity: 100 }
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
    organizer: { firstName: 'Mike', lastName: 'Johnson' },
    totalTickets: 1100,
    availableTickets: 850,
    rating: 4.6,
    reviews: 203,
    tags: ['sports', 'fitness', 'competition']
  }
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchInputValue, setSearchInputValue] = useState('');

  // Fetch events on component mount
  useEffect(() => {
    console.log('useEffect running');
    const loadEvents = () => {
      try {
        console.log('Loading events...');
        // Simulate API call
        setTimeout(() => {
          console.log('Setting events:', MOCK_EVENTS);
          setEvents(MOCK_EVENTS);
        }, 100);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    loadEvents();
  }, []);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery.trim() === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
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
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white" data-testid="hero-section">
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
                className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
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
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12" data-testid="no-events">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="events-grid">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    data-testid="event-card"
                  />
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
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Events Listed</h3>
                <p className="text-2xl font-bold text-indigo-600">1,200+</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-2xl font-bold text-green-600">50K+</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
                <p className="text-2xl font-bold text-yellow-500">4.8</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Satisfaction</h3>
                <p className="text-2xl font-bold text-purple-600">98%</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16" data-testid="cta-section">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Host Your Own Event?</h2>
                <p className="text-xl mb-8">Join thousands of event organizers who trust our platform</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/events/create"
                    className="px-8 py-3 bg-white text-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
                    aria-label="Create new event"
                  >
                    Get Started Today
                  </Link>
                  <Link
                    to="/events/create"
                    className="px-8 py-3 bg-transparent border-2 border-white text-indigo-600 rounded-md hover:bg-white hover:text-indigo-700 transition-colors duration-200 font-medium"
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