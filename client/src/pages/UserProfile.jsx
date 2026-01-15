import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Camera, 
  Edit, 
  Shield, 
  Star, 
  Clock,
  Heart,
  Ticket,
  Award,
  Navigation
} from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data for development
  const mockUser = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    bio: 'Event enthusiast and concert lover. Always looking for the next amazing experience. Music is my passion and I love discovering new artists and venues.',
    avatar: 'https://images.unsplash.com/photo-149476010052-1f8a2f6b6a0d3?w=400&h=400&fit=crop',
    joinDate: '2022-01-15',
    location: 'New York, NY',
    preferences: {
      notifications: true,
      emailMarketing: false,
      publicProfile: true,
      language: 'en'
    },
    stats: {
      eventsAttended: 47,
      eventsOrganized: 3,
      totalSpent: 1250,
      favoriteVenues: 12,
      reviews: 28,
      averageRating: 4.6
    },
    interests: [
      'Rock Music',
      'Electronic Music',
      'Jazz',
      'Classical',
      'Indie',
      'Hip Hop',
      'Live Concerts',
      'Music Festivals'
    ],
    badges: [
      {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Joined in first month of platform launch',
        icon: '🌟'
      },
      {
        id: 'super_fan',
        name: 'Super Fan',
        description: 'Attended 25+ events',
        icon: '⭐'
      },
      {
        id: 'event_organizer',
        name: 'Event Organizer',
        description: 'Successfully organized 3 events',
        icon: '🎯'
      },
      {
        id: 'reviewer',
        name: 'Active Reviewer',
        description: 'Written 28 helpful reviews',
        icon: '📝'
      }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Summer Music Festival 2024',
        date: '2024-07-15',
        status: 'attending',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop'
      },
      {
        id: '2',
        title: 'Jazz Night at Blue Note',
        date: '2024-08-20',
        status: 'attending',
        image: 'https://images.unsplash.com/photo-1514599377335-4a7c4b6b6a0d3?w=400&h=250&fit=crop'
      },
      {
        id: '3',
        title: 'Rock Concert at Madison Square',
        date: '2024-09-10',
        status: 'past',
        image: 'https://images.unsplash.com/photo-1540575167028-0e7a0b6b5b1a?w=400&h=250&fit=crop'
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'event_attendance',
        title: 'Attended Summer Music Festival',
        date: '2024-07-15',
        description: 'Had an amazing time at the festival'
      },
      {
        id: '2',
        type: 'review',
        title: 'Reviewed Jazz Night at Blue Note',
        date: '2024-08-18',
        description: 'Left a 5-star review'
      },
      {
        id: '3',
        type: 'profile_update',
        title: 'Updated profile picture',
        date: '2024-08-10',
        description: 'Added new profile photo'
      }
    ],
    paymentMethods: [
      {
        id: '1',
        type: 'credit_card',
        last4: '4242',
        brand: 'Visa',
        isDefault: true
      },
      {
        id: '2',
        type: 'paypal',
        last4: '8376',
        brand: 'PayPal',
        isDefault: false
      }
    ]
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Uncomment when API is ready
        // const response = await usersAPI.getById(id);
        setUser(mockUser);
      } catch (err) {
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      // Here you would make an API call
      console.log('Saving profile:', updatedData);
      setUser({ ...user, ...updatedData });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleUploadAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        // Here you would upload to your API
        console.log('Avatar uploaded:', result);
        setUser({ ...user, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The user you\'re looking for doesn\'t exist or has been removed.'}</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
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
              Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 text-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Save' : 'Edit'} Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Header */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={user?.avatar || 'https://images.unsplash.com/photo-149476010052-1f8a2f6b6a0d3?w=400&h=400&fit=crop'} 
                    alt={user?.firstName || 'User'}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white"
                  />
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full opacity-0 hover:opacity-80 transition-opacity duration-200"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    className="hidden"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.firstName || 'John'} {user?.lastName || 'Doe'}</h2>
                  <p className="text-gray-600">@{user?.email || 'username'}</p>
                  <p className="text-sm text-gray-500">Member since {user?.joinDate || 'January 2022'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{user?.stats?.eventsAttended || 0}</div>
                    <p className="text-gray-600">Events Attended</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{user?.stats?.eventsOrganized || 0}</div>
                    <p className="text-gray-600">Events Organized</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{user?.stats?.totalSpent || 0}</div>
                    <p className="text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{user?.stats?.averageRating || 0}</div>
                    <p className="text-gray-600">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>

              {/* Bio */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                <p className="text-gray-700 leading-relaxed">
                  {user?.bio || 'User bio will appear here.'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex space-x-1 border-b border-gray-200">
                {['events', 'tickets', 'settings'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium transition-colors duration-200 ${
                      activeTab === tab
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                  >
                    {tab === 'events' && <Calendar className="h-4 w-4 mr-2" />}
                    {tab === 'tickets' && <Ticket className="h-4 w-4 mr-2" />}
                    {tab === 'settings' && <Settings className="h-4 w-4 mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'events' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.upcomingEvents?.map((event, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                            <p className="text-sm text-indigo-600">{event.status === 'attending' ? 'Attending' : 'Past Event'}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                              {event.status === 'attending' ? 'Going' : 'Went'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-4">
                    {user?.paymentMethods?.map((method, index) => (
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{user?.stats?.totalSpent || 0}</div>
                  <p className="text-gray-600">Total Spent</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{user?.stats?.averageRating || 0}</div>
                  <p className="text-gray-600">Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
            <p className="text-gray-700 leading-relaxed">
              {user?.bio || 'User bio will appear here.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex space-x-1 border-b border-gray-200">
            {['events', 'tickets', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 border-transparent'
                }`}
              >
                {tab === 'events' && <Calendar className="h-4 w-4 mr-2" />}
                {tab === 'tickets' && <Ticket className="h-4 w-4 mr-2" />}
                {tab === 'settings' && <Settings className="h-4 w-4 mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.upcomingEvents?.map((event, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                        <p className="text-sm text-indigo-600">{event.status === 'attending' ? 'Attending' : 'Past Event'}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {event.status === 'attending' ? 'Going' : 'Went'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {user?.paymentMethods?.map((method, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">{method.brand} ending in {method.last4}</div>
                        <div className="text-sm text-gray-600">{method.type.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-xs text-gray-500">Default: {method.isDefault ? 'Yes' : 'No'}</div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800">
                        {method.isDefault ? 'Set as Default' : 'Make Default'}
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user?.preferences?.notifications}
                          className="sr-only"
                          onChange={() => {}}
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full border-2 border-gray-300"></div>
                      </label>
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Email Marketing</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                          type="checkbox"
                          checked={user?.preferences?.emailMarketing}
                          className="sr-only"
                          onChange={() => {}}
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full border-2 border-gray-300"></div>
                      </label>
                    </div>
                  </div>

                  {/* Public Profile */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Public Profile</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                          type="checkbox"
                          checked={user?.preferences?.publicProfile}
                          className="sr-only"
                          onChange={() => {}}
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full border-2 border-gray-300"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {user?.badges?.map((badge, index) => (
              <div key={index} className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>

      {/* Recent Activity */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {user?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                    <p className="text-gray-700">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.type.replace('_', ' ').toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
