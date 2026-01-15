import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Navigation, 
  ArrowLeft,
  Calendar,
  Users,
  Clock
} from 'lucide-react';

const VenueDetail = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock venue data for development
  const mockVenue = {
    id: '1',
    name: 'Madison Square Garden',
    description: 'One of the most famous arenas in the world, home to the New York Knicks, concerts, and major sporting events. This iconic venue has hosted countless historic moments and continues to be a premier destination for entertainment.',
    address: {
      street: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    capacity: 20000,
    type: 'arena',
    features: [
      'Retractable roof',
      'Premium seating',
      'Multiple concession areas',
      'State-of-the-art sound system',
      'VIP suites',
      'Multiple restaurants',
      'Gift shops'
    ],
    contact: {
      phone: '+1 (212) 465-6000',
      email: 'info@msg.com',
      website: 'https://www.msg.com'
    },
    images: [
      'https://images.unsplash.com/photo-1540575167028-0e7a0b6b5b1a?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'
    ],
    rating: 4.7,
    reviews: 2843,
    upcomingEvents: [
      {
        id: '1',
        title: 'Knicks vs Lakers',
        date: '2024-12-15',
        time: '19:30'
      },
      {
        id: '2',
        title: 'Taylor Swift - Eras Tour',
        date: '2024-08-20',
        time: '20:00'
      }
    ],
    amenities: [
      'Free Wi-Fi',
      'Multiple restaurants',
      'Gift shops',
      'ATM machines',
      'VIP lounges',
      'Family restrooms',
      'First aid stations'
    ],
    accessibility: {
      wheelchairAccessible: true,
      assistedListening: true,
      signLanguage: 'ASL',
      accessibleParking: true
    },
    transportation: {
      subway: {
        lines: ['4', '6', '7'],
        station: '34th St-Penn Station',
        distance: '0.3 miles'
      },
      bus: {
        routes: ['M1', 'M2', 'M3', 'M4'],
        stops: ['Multiple stops nearby']
      },
      taxi: 'Available',
      parking: {
        totalSpots: 200,
        vipSpots: 50,
        dailyRate: 45,
        validation: true
      }
    }
  };

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        // Uncomment when API is ready
        // const response = await venuesAPI.getById(id);
        setVenue(mockVenue);
      } catch (err) {
        setError('Failed to load venue details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The venue you\'re looking for doesn\'t exist or has been removed.'}</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venues
            </Link>
          </div>
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
              Back to Venues
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Venue Details</h1>
          </div>
        </div>
      </div>

      {/* Venue Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Venue Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Venue Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venue?.images?.map((image, index) => (
                <img 
                  key={index}
                  src={image}
                  alt={`${venue?.name} - View ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              ))}
            </div>
          </div>

          {/* Venue Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{venue?.name || 'Venue Name'}</h2>
              
              {/* Rating and Reviews */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">{venue?.rating || 4.0}</span>
                  <span className="text-gray-600 ml-2">({venue?.reviews || 0} reviews)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-6">{venue?.description || 'Venue description will appear here.'}</p>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 mt-1" />
                  <div>
                    <p>{venue?.address?.street || 'Street Address'}</p>
                    <p>{venue?.address?.city || 'City'}, {venue?.address?.state || 'State'} {venue?.address?.zipCode || 'ZIP'}</p>
                    <p>{venue?.address?.country || 'Country'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{venue?.contact?.phone || '+1 (555) 123-4567'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{venue?.contact?.email || 'info@venue.com'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-5 w-5 mr-2" />
                    <a href={venue?.contact?.website || '#'} className="text-indigo-600 hover:text-indigo-800" target="_blank">
                      {venue?.contact?.website || 'venue.com'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Capacity and Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Venue Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{venue?.capacity || 0} capacity</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Type:</span> {venue?.type || 'Venue Type'}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Venue Features</h3>
                <ul className="space-y-2">
                  {venue?.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Events</h3>
            <div className="space-y-4">
              {venue?.upcomingEvents?.map((event, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">
                        {event.status === 'upcoming' ? 'Upcoming' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* Transportation */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Transportation & Parking</h3>
          <div className="space-y-4">
            {/* Subway */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2">Subway</h4>
              <div className="text-gray-600">
                <Navigation className="h-5 w-5 mr-2" />
                <span>Lines: {venue?.transportation?.subway?.lines?.join(', ') || 'N/A'}</span>
              </div>
              <div className="text-gray-600">
                <span>Station: {venue?.transportation?.subway?.station || 'N/A'}</span>
              </div>
              <div className="text-gray-600">
                <span>Distance: {venue?.transportation?.subway?.distance || 'N/A'} miles</span>
              </div>
            </div>

            {/* Bus */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2">Bus</h4>
              <div className="text-gray-600">
                <span>Routes: {venue?.transportation?.bus?.routes?.join(', ') || 'N/A'}</span>
              </div>
            </div>

            {/* Parking */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2">Parking</h4>
              <div className="text-gray-600">
                <span>Total Spots: {venue?.transportation?.parking?.totalSpots || 0}</span>
              </div>
              <div className="text-gray-600">
                <span>VIP Spots: {venue?.transportation?.parking?.vipSpots || 0}</span>
              </div>
              <div className="text-gray-600">
                <span>Daily Rate: ${venue?.transportation?.parking?.dailyRate || 0}</span>
              </div>
              <div className="text-gray-600">
                <span>Validation: {venue?.transportation?.parking?.validation ? 'Available' : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Taxi */}
          <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2">Taxi</h4>
              <div className="text-gray-600">
                <span>{venue?.transportation?.taxi || 'Available'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {venue?.amenities?.map((amenity, index) => (
              <div key={index} className="flex items-center text-gray-600">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility</h3>
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>Wheelchair Accessible: {venue?.accessibility?.wheelchairAccessible ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>Assisted Listening: {venue?.accessibility?.assistedListening ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>Sign Language: {venue?.accessibility?.signLanguage || 'N/A'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>Accessible Parking: {venue?.accessibility?.accessibleParking ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Event
          </button>
          <button
            className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
