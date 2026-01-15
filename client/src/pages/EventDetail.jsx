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

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Transform backend event data to match component expectations
  const transformEventData = (backendEvent) => {
    if (!backendEvent) return null;
    
    const eventDate = new Date(backendEvent.date);
    return {
      id: backendEvent.id,
      title: backendEvent.title || 'Untitled Event',
      description: backendEvent.description || 'No description available.',
      category: backendEvent.category?.name?.toLowerCase() || 'other',
      date: backendEvent.date,
      time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    venue: {
        name: backendEvent.location || 'Venue TBA',
        address: backendEvent.location || '',
        capacity: backendEvent.capacity || 0
    },
    ticketTypes: [
      { 
          id: 'general', 
        name: 'General Admission', 
          price: backendEvent.price || 0, 
          quantity: Math.floor((backendEvent.capacity || 0) * 0.8),
          description: 'Access to all general areas'
        }
    ],
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
      organizer: backendEvent.organizer?.username || 'Event Organizer',
      totalTickets: backendEvent.capacity || 0,
      availableTickets: Math.floor((backendEvent.capacity || 0) * 0.8),
      tags: [],
    ageRestriction: 'All ages',
      features: []
    };
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await eventsAPI.getById(id);
        const transformedEvent = transformEventData(response.data);

        if (!transformedEvent) {
          setError('Event data is invalid.');
          return;
        }
        
        setEvent(transformedEvent);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        if (err.response?.status === 404) {
          setError('Event not found.');
        } else if (!err.response) {
          setError('Server is under maintenance. Please try again later.');
        } else {
        setError('Failed to load event details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
    fetchEvent();
    } else {
      setError('Invalid event ID.');
      setLoading(false);
    }
  }, [id]);

  const handlePurchase = (tickets) => {
    console.log('Purchasing tickets:', tickets);
    // Here you would integrate with your payment processing
    // For now, just show a success message
    alert('Purchase functionality would be integrated here. Tickets selected:', JSON.stringify(tickets, null, 2));
  };

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title || 'Event',
        text: event.description || '',
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Here you would make an API call to save/remove favorite
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
        <div className="text-center max-w-md">
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBA';
    try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || '00'} ${ampm}`;
    } catch (e) {
      return 'Invalid time';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={event?.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop'}
          alt={event?.title || 'Event'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-md hover:bg-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-md hover:bg-white transition-colors duration-200"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleFavorite}
            className={`p-2 backdrop-blur-sm rounded-md transition-colors duration-200 ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-900 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-white mb-2">{event?.title || 'Event'}</h1>
            <div className="flex items-center space-x-4 text-white/90">
              {event?.category && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </span>
              )}
              {event?.availableTickets !== undefined && (
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {event.availableTickets} tickets left
              </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {event?.description || 'No description available.'}
              </p>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event?.date && (
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Date</div>
                    <div className="text-gray-600">{formatDate(event.date)}</div>
                  </div>
                </div>
                )}

                {event?.time && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Time</div>
                    <div className="text-gray-600">{formatTime(event.time)}</div>
                  </div>
                </div>
                )}

                {event?.venue?.name && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Venue</div>
                    <div className="text-gray-600">{event.venue.name}</div>
                      {event.venue.address && (
                    <div className="text-sm text-gray-500">{event.venue.address}</div>
                      )}
                    </div>
                  </div>
                )}

                {event?.venue?.capacity && (
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Capacity</div>
                    <div className="text-gray-600">{event.venue.capacity} people</div>
                  </div>
                </div>
                )}
              </div>

              {/* Tags */}
              {event?.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {event.features && event.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {event.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Organizer Info */}
            {event?.organizer && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Organized by</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{event.organizer}</div>
                  <div className="text-sm text-gray-600">Event Organizer</div>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200">
                  Follow
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Sidebar - Ticket Selector */}
          {event && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TicketSelector event={event} onPurchase={handlePurchase} />
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;