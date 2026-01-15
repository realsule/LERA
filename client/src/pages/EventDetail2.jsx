import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import TicketSelector from '../components/events/TicketSelector';
import { eventsAPI } from '../services/api';

const EventDetail2 = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Mock event data for development
  const mockEvent = {
    id: '2',
    title: 'Tech Innovation Summit 2024',
    description: 'Join industry leaders for a deep dive into the latest technology trends. This premier tech conference brings together innovators, entrepreneurs, and investors from around the globe. Experience cutting-edge presentations, interactive workshops, and unparalleled networking opportunities.',
    category: 'conference',
    date: '2024-08-20',
    time: '09:00',
    venue: {
      name: 'Tech Hub Convention Center',
      address: '456 Innovation Boulevard, San Francisco, CA 94105',
      capacity: 2000,
      features: ['State-of-the-art AV equipment', 'Multiple conference rooms', 'Exhibition hall', 'Networking lounge']
    },
    ticketTypes: [
      { 
        id: 'standard', 
        name: 'Standard Pass', 
        price: 299, 
        quantity: 200,
        description: 'Access to all main sessions and exhibition area'
      },
      { 
        id: 'premium', 
        name: 'Premium Pass', 
        price: 599, 
        quantity: 50,
        description: 'VIP access with priority seating, workshop access, and exclusive networking events'
      },
      { 
        id: 'workshop', 
        name: 'Workshop Bundle', 
        price: 399, 
        quantity: 100,
        description: 'Access to all hands-on workshops and materials'
      }
    ],
    image: 'https://images.unsplash.com/photo-1540575167028-0e7a0b6b5b1a?w=400&h=250&fit=crop',
    organizer: {
      name: 'Tech Innovation Foundation',
      email: 'info@techinnovation.org',
      phone: '+1 (555) 123-4567',
      website: 'https://techinnovation.org'
    },
    totalTickets: 350,
    availableTickets: 180,
    rating: 4.8,
    reviews: 95,
    tags: ['tech', 'innovation', 'networking', 'AI', 'blockchain'],
    ageRestriction: '18+',
    features: [
      'Live streaming available',
      'International speakers',
      'Hands-on workshops',
      'AI demonstrations',
      'Startup pitch competition',
      'Career fair',
      'Networking sessions'
    ]
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Uncomment when API is ready
        // const response = await eventsAPI.getById(id);
        // setEvent(response.data);
        setEvent(mockEvent);
      } catch (err) {
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handlePurchase = (tickets) => {
    console.log('Purchasing tickets:', tickets);
    // Here you would integrate with your payment processing
    alert(`Purchase functionality would be integrated here. Tickets selected: ${JSON.stringify(tickets, null, 2)}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Amazing Event',
        text: event?.description || 'Check out this incredible event!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Here you would make an API call to save/remove favorite
    console.log('Favorite status updated:', !isFavorited);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Image */}
          <div className="lg:col-span-1">
            <img 
              src={event?.image || 'https://images.unsplash.com/photo-1540575167028-0e7a0b6b5b1a?w=400&h=250&fit=crop'} 
              alt={event?.title || 'Event'}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Event Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-gray-900">{event?.title || 'Event Title'}</h2>
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isFavorited 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Date and Time */}
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{event?.date || '2024-08-20'} at {event?.time || '09:00'}</span>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event?.venue?.name || 'Venue Name'}</span>
                </div>

                {/* Organizer */}
                <div className="flex items-center text-gray-600 mb-2">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Organized by {event?.organizer?.firstName || 'John'} {event?.organizer?.lastName || 'Doe'}</span>
                </div>

                {/* Capacity */}
                <div className="flex items-center text-gray-600 mb-2">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{event?.totalTickets || 0} total capacity</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{event?.description || 'Event description will appear here.'}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {event?.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Features */}
              {event?.features?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Features</h3>
                  <ul className="space-y-2">
                    {event?.features?.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Ticket Selection */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Tickets</h3>
              <TicketSelector 
                ticketTypes={event?.ticketTypes || []}
                availableTickets={event?.availableTickets || 0}
                onPurchase={handlePurchase}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Purchase Tickets
              </button>
              <button
                onClick={handleShare}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Purchase</h3>
            <p className="text-gray-600 mb-4">Select your tickets and complete the purchase to secure your spot at this amazing event.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail2;
