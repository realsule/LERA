import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Ticket, TrendingUp } from 'lucide-react';
import EventCard from '../components/Events/EventCard';
import { eventsAPI } from '../services/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for development
  const mockEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      description: 'Experience the best of live music with top artists from around the world.',
      category: 'concert',
      date: '2024-07-15',
      time: '18:00',
      venue: {
        name: 'Central Park Arena',
        address: '123 Park Ave, New York, NY',
      },
      ticketTypes: [
        { name: 'General Admission', price: 75, quantity: 500 },
        { name: 'VIP Pass', price: 150, quantity: 100 },
      ],
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop',
      organizer: 'Live Nation',
      totalTickets: 600,
      availableTickets: 450,
    },
    {
      id: '2',
      title: 'Tech Innovation Summit',
      description: 'Join industry leaders for a deep dive into the latest technology trends.',
      category: 'conference',
      date: '2024-08-20',
      time: '09:00',
      venue: {
        name: 'Convention Center',
        address: '456 Tech Blvd, San Francisco, CA',
      },
      ticketTypes: [
        { name: 'Standard', price: 299, quantity: 200 },
        { name: 'Premium', price: 599, quantity: 50 },
      ],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
      organizer: 'TechCorp',
      totalTickets: 250,
      availableTickets: 180,
    },
    {
      id: '3',
      title: 'Food & Wine Festival',
      description: 'Savor exquisite cuisines and premium wines from renowned chefs and wineries.',
      category: 'party',
      date: '2024-09-10',
      time: '12:00',
      venue: {
        name: 'Riverside Gardens',
        address: '789 River Road, Chicago, IL',
      },
      ticketTypes: [
        { name: 'Tasting Pass', price: 120, quantity: 300 },
        { name: 'VIP Experience', price: 250, quantity: 75 },
      ],
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
      organizer: 'Gourmet Events',
      totalTickets: 375,
      availableTickets: 200,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'concert', label: 'Concerts' },
    { value: 'conference', label: 'Conferences' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'party', label: 'Parties' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Uncomment when API is ready
        // const response = await eventsAPI.getAll({ 
        //   category: selectedCategory !== 'all' ? selectedCategory : undefined,
        //   search: searchQuery 
        // });
        // setEvents(response.data);

        // Using mock data for now
        const filteredEvents = mockEvents.filter(event => {
          const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
          const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               event.description.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        setEvents(filteredEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, selectedCategory]);

  const stats = [
    { icon: Ticket, label: 'Events Listed', value: '1,200+' },
    { icon: Users, label: 'Active Users', value: '50,000+' },
    { icon: Star, label: 'Satisfaction Rate', value: '98%' },
    { icon: TrendingUp, label: 'Tickets Sold', value: '100,000+' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Discover Amazing Events Near You
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Find and book tickets for concerts, conferences, sports, and more. 
              Your next unforgettable experience is just a click away.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search events, artists, venues..."
                  className="w-full py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 text-gray-900 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium">
                Search Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these upcoming events. Book your tickets now before they sell out!
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No events found matching your criteria.</div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Host Your Own Event?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of event organizers who trust our platform to sell tickets and manage their events seamlessly.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors duration-200 font-medium"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;