import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, Heart, Share2, Eye } from 'lucide-react';

const EventCard = ({ event, showActions = true }) => {
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

  const getLowestPrice = (ticketTypes) => {
    if (!ticketTypes || ticketTypes.length === 0) return 0;
    return Math.min(...ticketTypes.map(ticket => ticket.price));
  };

  const getAvailabilityStatus = (availableTickets, totalTickets) => {
    const percentage = (availableTickets / totalTickets) * 100;
    if (percentage === 0) return 'sold-out';
    if (percentage < 20) return 'limited';
    return 'available';
  };

  const availabilityStatus = getAvailabilityStatus(event.availableTickets, event.totalTickets);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300" data-testid="event-card">
      {/* Event Image */}
      <div className="relative h-48">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            availabilityStatus === 'sold-out' 
              ? 'bg-red-100 text-red-800' 
              : availabilityStatus === 'limited'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {availabilityStatus === 'sold-out' ? 'Sold Out' : 
             availabilityStatus === 'limited' ? 'Limited' : 'Available'}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
            {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
          </span>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <button 
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
              aria-label="Add to favorites"
            >
              <Heart className="h-4 w-4 text-gray-600" />
            </button>
            <button 
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
              aria-label="Share event"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)} at {formatTime(event.time)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.venue?.name || event.venue}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {event.availableTickets}/{event.totalTickets} tickets
            </span>
            <span className="font-semibold text-gray-900">
              From ${getLowestPrice(event.ticketTypes)}
            </span>
          </div>
        </div>

        {/* Rating */}
        {event.rating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(event.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {event.rating.toFixed(1)} ({event.reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Organizer Info */}
        {event.organizer && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-gray-600">
                  {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {event.organizer.firstName} {event.organizer.lastName}
                </p>
                <p className="text-xs text-gray-500">Organizer</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Organizer</p>
            </div>
          </div>
        )}

        {/* Rating */}
        {event.rating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(event.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {event.rating.toFixed(1)} ({event.reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/events/${event.id}`}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
            aria-label="View event details"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
          {showActions && (
            <>
              <button 
                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
                aria-label="Add to favorites"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button 
                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
                aria-label="Share event"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
