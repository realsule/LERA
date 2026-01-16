import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Ticket, TrendingUp, AlertCircle } from 'lucide-react';
import EventCard from "../components/events/EventCard";
import { eventsAPI } from '../services/api';

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

  const transformEventData = (backendEvent) => {
    if (!backendEvent) return null;
    
    try {
      const eventDate = backendEvent.date ? new Date(backendEvent.date) : new Date();
      
      const getEventImage = (title) => {
        const t = title.toLowerCase();
        if (t.includes('music') || t.includes('festival')) return 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1000&auto=format&fit=crop';
        if (t.includes('tech') || t.includes('innovation') || t.includes('summit')) return 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?q=80&w=1000&auto=format&fit=crop';
        if (t.includes('marathon') || t.includes('championship') || t.includes('sports')) return 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop';
        return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop';
      };
      
      return {
        id: backendEvent.id || null,
        title: backendEvent.title || 'Untitled Event',
        description: backendEvent.description || 'No description available.',
        category: 'other',
        date: backendEvent.date || new Date().toISOString(),
        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: backendEvent.location || 'Venue TBA',
        image: getEventImage(backendEvent.title),
        ticketTypes: [ 
          { 
            name: 'General Admission', 
            price: `KSH ${backendEvent.price || 0}`, // Updated to Kenyan Shillings
            quantity: Math.floor((backendEvent.capacity || 0) * 0.8) 
          }
        ],
        organizer: { firstName: 'Event', lastName: 'Organizer' },
        totalTickets: backendEvent.capacity || 0,
        availableTickets: Math.floor((backendEvent.capacity || 0) * 0.8),
        rating: 4.5,
        reviews: 0,
        tags: []
      };
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getAll();
        const backendEvents = Array.isArray(response.data) ? response.data : [];
        const transformedEvents = backendEvents.map(transformEventData).filter(e => e !== null);
        setEvents(transformedEvents);
      } catch (err) {
        setEvents([]); // Fallback
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    if (!event || !event.title) return false;
    const matchesSearch = searchQuery.trim() === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Discover Amazing Events Near You</h1>
            <p className="text-xl mb-8 text-blue-100">Find and book tickets for concerts, conferences, and more.</p>
            
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchInputValue}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchInputValue(e.target.value); }}
                  className="w-full py-3 text-gray-900 focus:outline-none"
                />
              </div>
              <button className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">Search</button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Localized Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border-t-4 border-green-500">
              <Calendar className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
              <p className="text-3xl font-bold text-green-600">50K+</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border-t-4 border-yellow-500">
              <Star className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
              <p className="text-3xl font-bold text-yellow-500">4.8</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border-t-4 border-purple-500">
              <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Satisfaction</h3>
              <p className="text-3xl font-bold text-purple-600">98%</p>
            </div>
          </div>

          {/* CTA Section */}
          <section className="bg-purple-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Host Your Own Event?</h2>
            <Link to="/events/create" className="inline-block px-10 py-4 bg-white text-purple-700 rounded-full font-bold hover:bg-gray-100 transition-all">
              Get Started Today
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Home;