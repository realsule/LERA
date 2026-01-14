import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, Star } from 'lucide-react';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getLowestPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return 0;
    return Math.min(...event.ticketTypes.map(type => type.price));
  };

  const getAvailabilityStatus = () => {
    if (!event.availableTickets || !event.totalTickets) return 'available';
    const percentage = (event.availableTickets / event.totalTickets) * 100;
    
    if (percentage === 0) return 'sold-out';
    if (percentage < 20) return 'limited';
    return 'available';
  };

  const availabilityStatus = getAvailabilityStatus();
  const lowestPrice = getLowestPrice();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
            {event.category?.charAt(0).toUpperCase() + event.category?.slice(1) || 'Event'}
          </span>
        </div>

        {/* Availability Status */}
        <div className="absolute top-3 right-3">
          {availabilityStatus === 'sold-out' ? (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              Sold Out
            </span>
          ) : availabilityStatus === 'limited' ? (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Limited
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Available
            </span>
          )}
        </div>

        {/* Date Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Date</div>
            <div className="text-sm font-bold text-gray-900">
              {formatDate(event.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          <Link to={`/events/${event.id}`}>
            {event.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {formatDate(event.date)} at {formatTime(event.time)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {event.venue?.name || 'Venue TBD'}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            {event.availableTickets || 0} tickets left
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">From</div>
            <div className="text-lg font-bold text-gray-900">
              ${lowestPrice}
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Get Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
