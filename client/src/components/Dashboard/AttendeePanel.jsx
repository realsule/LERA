import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Ticket, 
  Clock, 
  Download,
  QrCode,
  Filter,
  Heart,
  Share2,
  Eye
} from 'lucide-react';
import { ticketsAPI, eventsAPI } from '../../services/api';

const AttendeePanel = () => {
  const [myTickets, setMyTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data for development
  const mockTickets = [
    {
      id: '1',
      eventId: '1',
      eventTitle: 'Summer Music Festival',
      eventCategory: 'concert',
      eventDate: '2024-07-15',
      eventTime: '18:00',
      venueName: 'Central Park Arena',
      venueAddress: '123 Park Ave, New York, NY',
      ticketType: 'General Admission',
      quantity: 2,
      totalPrice: 150,
      purchaseDate: '2024-06-01',
      status: 'active',
      qrCode: 'QR123456789',
      eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=120&fit=crop',
    },
    {
      id: '2',
      eventId: '2',
      eventTitle: 'Tech Innovation Summit',
      eventCategory: 'conference',
      eventDate: '2024-08-20',
      eventTime: '09:00',
      venueName: 'Convention Center',
      venueAddress: '456 Tech Blvd, San Francisco, CA',
      ticketType: 'VIP Pass',
      quantity: 1,
      totalPrice: 599,
      purchaseDate: '2024-06-15',
      status: 'active',
      qrCode: 'QR987654321',
      eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=120&fit=crop',
    },
    {
      id: '3',
      eventId: '3',
      eventTitle: 'Food & Wine Festival',
      eventCategory: 'party',
      eventDate: '2024-05-10',
      eventTime: '12:00',
      venueName: 'Riverside Gardens',
      venueAddress: '789 River Road, Chicago, IL',
      ticketType: 'Tasting Pass',
      quantity: 4,
      totalPrice: 480,
      purchaseDate: '2024-04-20',
      status: 'expired',
      qrCode: 'QR456789123',
      eventImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=120&fit=crop',
    },
  ];

  const mockEvents = [
    {
      id: '4',
      title: 'Jazz Night Live',
      category: 'concert',
      date: '2024-07-25',
      time: '20:00',
      venue: 'Blue Note Club',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=250&fit=crop',
      price: 45,
      availableTickets: 50,
    },
    {
      id: '5',
      title: 'Startup Pitch Day',
      category: 'conference',
      date: '2024-08-05',
      time: '14:00',
      venue: 'Innovation Hub',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop',
      price: 25,
      availableTickets: 120,
    },
    {
      id: '6',
      title: 'Wine Tasting Evening',
      category: 'party',
      date: '2024-08-15',
      time: '19:00',
      venue: 'Vineyard Estate',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2fd2722f5?w=400&h=250&fit=crop',
      price: 85,
      availableTickets: 30,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'concert', label: 'Concerts' },
    { value: 'conference', label: 'Conferences' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'party', label: 'Parties' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Uncomment when API is ready
        // const [ticketsResponse, eventsResponse] = await Promise.all([
        //   ticketsAPI.getMyTickets(),
        //   eventsAPI.getAll({ featured: true })
        // ]);
        // setMyTickets(ticketsResponse.data);
        // setEvents(eventsResponse.data);

        // Using mock data for now
        setMyTickets(mockTickets);
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching attendee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadTicket = (ticket) => {
    // In a real app, this would generate and download a PDF ticket
    alert(`Downloading ticket for ${ticket.eventTitle}`);
  };

  const handleShareTicket = (ticket) => {
    if (navigator.share) {
      navigator.share({
        title: `My ticket for ${ticket.eventTitle}`,
        text: `Join me at ${ticket.eventTitle} on ${new Date(ticket.eventDate).toLocaleDateString()}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ticket link copied to clipboard!');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const activeTickets = myTickets.filter(ticket => ticket.status === 'active');
  const expiredTickets = myTickets.filter(ticket => ticket.status === 'expired');

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{activeTickets.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Ticket className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeTickets.filter(ticket => new Date(ticket.eventDate) > new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${myTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['tickets', 'discover'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'tickets' ? 'My Tickets' : 'Discover Events'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {activeTickets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tickets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-32">
                          <img
                            src={ticket.eventImage}
                            alt={ticket.eventTitle}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h4 className="text-white font-semibold text-sm truncate">{ticket.eventTitle}</h4>
                            <p className="text-white/80 text-xs">{ticket.venueName}</p>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(ticket.eventDate)} at {formatTime(ticket.eventTime)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {ticket.venueName}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Ticket className="h-4 w-4 mr-2" />
                                {ticket.quantity}x {ticket.ticketType}
                              </span>
                              <span className="font-medium text-gray-900">
                                ${ticket.totalPrice}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200">
                              <QrCode className="h-4 w-4 mr-1" />
                              QR Code
                            </button>
                            <button 
                              onClick={() => handleDownloadTicket(ticket)}
                              className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleShareTicket(ticket)}
                              className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiredTickets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Events</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {expiredTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={ticket.eventImage}
                              alt={ticket.eventTitle}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{ticket.eventTitle}</p>
                              <p className="text-sm text-gray-500">{formatDate(ticket.eventDate)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Expired
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {myTickets.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring events and purchase your first tickets!</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Discover Events
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
                          {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.date)} at {formatTime(event.time)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.venue}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Ticket className="h-4 w-4 mr-2" />
                            {event.availableTickets} left
                          </span>
                          <span className="font-semibold text-gray-900">
                            From ${event.price}
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        to={`/events/${event.id}`}
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeePanel;
