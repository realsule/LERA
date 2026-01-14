import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Ticket, TrendingUp, AlertTriangle } from 'lucide-react';
import EventCard from "../components/events/EventCard";
import ErrorBoundary from '../components/common/ErrorBoundary';

// Constants for better maintainability
const CATEGORIES = [
  { label: 'All Events', value: 'all' },
  { label: 'Concerts', value: 'concert' },
  { label: 'Conferences', value: 'conference' },
  { label: 'Sports', value: 'sports' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Parties', value: 'party' }
];

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

// Analytics tracking
const trackEvent = (eventName, properties = {}) => {
  // Mock analytics - in production this would send to real analytics service
  console.log('Analytics Event:', eventName, properties);
  
  // Example: window.gtag('event', eventName, properties);
};

// Custom hook for event filtering logic
const useEventFilter = (events, searchQuery, selectedCategory) => {
  return useMemo(() => {
    let filtered = events;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    return filtered;
  }, [events, searchQuery, selectedCategory]);
};

// Loading Skeleton Component
const EventSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

// Mock API call function
const fetchEvents = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EVENTS);
    }, 100); // Reduced delay for faster testing
  });
};

const HomeWithErrorBoundary = () => (
  <ErrorBoundary
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading events. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    }
  >
    <Home />
  </ErrorBoundary>
);

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchInputValue, setSearchInputValue] = useState('');

  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        setEvents(data);
        trackEvent('page_load', { 
          page: 'home', 
          events_count: data.length,
          load_time: Date.now()
        });
      } catch (error) {
        console.error('Failed to fetch events:', error);
        trackEvent('error', { 
          type: 'fetch_events_failed',
          message: error.message 
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Use custom hook for filtering
  const filteredEvents = useEventFilter(events, searchQuery, selectedCategory);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('[data-testid="search-input"]')?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape') {
        setSearchInputValue('');
        setSearchQuery('');
        setSelectedCategory('all');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInputValue);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Event handlers
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    trackEvent('search_input', { 
      search_term: value,
      input_length: value.length 
    });
  }, []);

  const handleCategoryChange = useCallback((e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    trackEvent('category_filter', { 
      category: category,
      filter_type: 'dropdown'
    });
  }, []);

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
    trackEvent('category_filter', { 
      category: category,
      filter_type: 'button'
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Discover Amazing Events Near You | LERA Event Platform</title>
        <meta name="description" content="Find and book tickets for concerts, conferences, sports, and more. Your next unforgettable experience is just a click away." />
        <meta name="keywords" content="events, concerts, conferences, sports, workshops, parties, tickets, booking" />
        <meta property="og:title" content="Discover Amazing Events Near You | LERA Event Platform" />
        <meta property="og:description" content="Find and book tickets for concerts, conferences, sports, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "LERA Event Platform",
            "description": "Discover and book amazing events near you",
            "url": typeof window !== 'undefined' ? window.location.href : '',
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${typeof window !== 'undefined' ? window.location.href : ''}/events?q={search_term}`,
              "query-input": "required name=search_term"
            }
          })}
        </script>
      </Helmet>
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

      {/* Loading State */}
      {loading && (
        <section className="py-12" data-testid="loading-section">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Loading Events</h2>
              <p className="text-gray-600">Finding amazing events for you...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <EventSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {!loading && (
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
                    onClick={() => handleCategoryClick(category.value)}
                    className={`p-4 rounded-lg border transition-colors duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-indigo-600'
                    }`}
                    data-testid={`category-${category.value}`}
                    aria-label={`Filter by ${category.label}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {category.value === 'concert' && '🎵'}
                        {category.value === 'conference' && '💼'}
                        {category.value === 'sports' && '⚽'}
                        {category.value === 'workshop' && '🎨'}
                        {category.value === 'party' && '🎉'}
                      </div>
                      <div className="text-sm font-medium">{category.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12" data-testid="statistics">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <Ticket className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">1,200+</div>
                <div className="text-gray-600">Events Listed</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">50K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">98%</div>
                <div className="text-gray-600">Satisfaction</div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white" data-testid="cta-section">
              <h2 className="text-3xl font-bold mb-4">Ready to Host Your Own Event?</h2>
              <p className="text-xl mb-8 text-indigo-100">Join thousands of event organizers who trust our platform</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors duration-200 font-medium"
                  data-testid="get-started-button"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/events"
                  className="inline-flex items-center px-8 py-3 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 transition-colors duration-200 font-medium"
                  data-testid="browse-events-button"
                >
                  Browse All Events
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
    </>
  );
};

export default HomeWithErrorBoundary;