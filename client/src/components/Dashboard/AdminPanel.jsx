/**
 * AdminPanel Component
 * 
 * Provides administrative interface for managing users, events, and platform analytics.
 * Features user management with suspension/activation, event approval/rejection workflow,
 * and comprehensive statistics dashboard.
 * 
 * @component
 * @returns {JSX.Element} Admin dashboard interface
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Ticket, 
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { eventsAPI, usersAPI } from '../../services/api';

const AdminPanel = () => {
  // State management for admin dashboard
  const [stats, setStats] = useState({
    totalUsers: 0,        // Total registered users
    totalEvents: 0,       // Total events on platform
    pendingEvents: 0,     // Events awaiting approval
    activeUsers: 0,       // Currently active users
  });
  const [users, setUsers] = useState([]);           // User list for management
  const [events, setEvents] = useState([]);         // Event list for approval
  const [loading, setLoading] = useState(true);     // Loading state
  const [activeTab, setActiveTab] = useState('overview'); // Active tab navigation
  const [searchTerm, setSearchTerm] = useState(''); // Search functionality
  const [filterStatus, setFilterStatus] = useState('all'); // Filter for events/users

  // Mock data for development - replace with API calls in production
  const mockStats = {
    totalUsers: 1247,
    totalEvents: 386,
    pendingEvents: 23,
    activeUsers: 892,
  };

  const mockUsers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-01-14',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'organizer',
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '2024-01-13',
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      role: 'attendee',
      status: 'suspended',
      joinDate: '2024-01-05',
      lastActive: '2024-01-12',
    },
  ];

  const mockEvents = [
    {
      id: '1',
      title: 'Summer Music Festival',
      category: 'concert',
      organizer: 'John Doe',
      organizerEmail: 'john.doe@example.com',
      date: '2024-07-15',
      status: 'pending',
      ticketsSold: 0,
      image: 'https://images.unsplash.com/photo-1459749410701-44d254a3cbaa?w=200&h=120&fit=crop',
    },
    {
      id: '2',
      title: 'Tech Innovation Summit',
      category: 'conference',
      organizer: 'Jane Smith',
      organizerEmail: 'jane.smith@example.com',
      date: '2024-08-20',
      status: 'approved',
      ticketsSold: 150,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=120&fit=crop',
    },
    {
      id: '3',
      title: 'Food & Wine Festival',
      category: 'party',
      organizer: 'Mike Johnson',
      organizerEmail: 'mike.johnson@example.com',
      date: '2024-09-10',
      status: 'approved',
      ticketsSold: 75,
      image: 'https://images.unsplash.com/photo-1414235077428-078e5daa3b70?w=200&h=120&fit=crop',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Uncomment when API is ready
        // const [usersResponse, eventsResponse, statsResponse] = await Promise.all([
        //   usersAPI.getAll(),
        //   eventsAPI.getAll(),
        //   eventsAPI.getStats()
        // ]);
        
        // setUsers(usersResponse.data);
        // setEvents(eventsResponse.data);
        // setStats(statsResponse.data);

        // Using mock data for now
        setUsers(mockUsers);
        setEvents(mockEvents);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveEvent = async (eventId) => {
    try {
      // Uncomment when API is ready
      // await eventsAPI.approve(eventId);
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, status: 'approved' }
            : event
        )
      );
    } catch (error) {
      console.error('Error approving event:', error);
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      // Uncomment when API is ready
      // await eventsAPI.reject(eventId);
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, status: 'rejected' }
            : event
        )
      );
    } catch (error) {
      console.error('Error rejecting event:', error);
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      // Uncomment when API is ready
      // await usersAPI.suspend(userId);
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'suspended' }
            : user
        )
      );
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      // Uncomment when API is ready
      // await usersAPI.activate(userId);
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'active' }
            : user
        )
      );
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event => 
    filterStatus === 'all' || event.status === filterStatus
  );

  const getSalesPercentage = (sold, total) => {
    return total > 0 ? Math.round((sold / total) * 100) : 0;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingEvents.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'users', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New users today</span>
                      <span className="text-sm font-medium text-gray-900">+12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Events created</span>
                      <span className="text-sm font-medium text-gray-900">+5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tickets sold</span>
                      <span className="text-sm font-medium text-gray-900">+234</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'organizer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {user.status === 'suspended' ? (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <CheckCircle className="h-4 w-4 inline" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4 inline" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Events</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organizer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">{event.title}</h5>
                              <p className="text-xs text-gray-500">{event.venue}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === 'approved' ? 'bg-green-100 text-green-800' :
                            event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {event.ticketsSold}/{event.totalTickets} sold
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${event.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {event.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveEvent(event.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="h-4 w-4 inline" />
                                </button>
                                <button
                                  onClick={() => handleRejectEvent(event.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="h-4 w-4 inline" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              
              {/* Revenue Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Trend</h4>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                    <p className="text-sm text-gray-400">Integrate with Chart.js or similar library</p>
                  </div>
                </div>
              </div>

              {/* Top Performing Events */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Top Performing Events</h4>
                <div className="space-y-4">
                  {events
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 3)
                    .map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">{event.ticketsSold} tickets sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${event.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{getSalesPercentage(event.ticketsSold, event.totalTickets)}% sold</p>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
