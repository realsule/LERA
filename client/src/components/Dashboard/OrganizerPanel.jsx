/**
 * OrganizerPanel Component
 * 
 * Provides event organizers with tools to manage their events, track sales,
 * and analyze performance metrics. Features event creation, editing, deletion,
 * sales analytics, and revenue tracking.
 * 
 * @component
 * @returns {JSX.Element} Organizer dashboard interface
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Ticket, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { eventsAPI } from '../../services/api';

const OrganizerPanel = () => {
  // State management for organizer dashboard
  const [stats, setStats] = useState({
    totalEvents: 0,        // Total events created by organizer
    upcomingEvents: 0,     // Events scheduled for future
    totalTicketsSold: 0,  // Total tickets sold across all events
    totalRevenue: 0,      // Total revenue from ticket sales
  });
  const [events, setEvents] = useState([]);         // Organizer's events list
  const [loading, setLoading] = useState(true);     // Loading state
  const [activeTab, setActiveTab] = useState('overview'); // Active tab navigation

  // Mock data for development - replace with API calls in production
  const mockStats = {
    totalEvents: 8,
    upcomingEvents: 3,
    totalTicketsSold: 1247,
    totalRevenue: 187050,
  };

  const mockEvents = [
    {
      id: '1',
      title: 'Summer Music Festival',
      category: 'concert',
      date: '2024-07-15',
      time: '18:00',
      venue: 'Central Park Arena',
      status: 'published',
      ticketsSold: 450,
      totalTickets: 1000,
      revenue: 33750,
      image: 'https://images.unsplash.com/photo-1459749410701-44d254a3cbaa?w=200&h=120&fit=crop',
    },
    {
      id: '2',
      title: 'Tech Innovation Summit',
      category: 'conference',
      date: '2024-08-20',
      time: '09:00',
      venue: 'Convention Center',
      status: 'draft',
      ticketsSold: 0,
      totalTickets: 250,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=120&fit=crop',
    },
    {
      id: '3',
      title: 'Food & Wine Festival',
      category: 'party',
      date: '2024-09-10',
      time: '12:00',
      venue: 'Riverside Gardens',
      status: 'published',
      ticketsSold: 180,
      totalTickets: 500,
      revenue: 21600,
      image: 'https://images.unsplash.com/photo-1414235077428-078e5daa3b70?w=200&h=120&fit=crop',
    },
  ];

  const mockSalesData = [
    { month: 'Jan', sales: 45, revenue: 6750 },
    { month: 'Feb', sales: 52, revenue: 7800 },
    { month: 'Mar', sales: 38, revenue: 5700 },
    { month: 'Apr', sales: 65, revenue: 9750 },
    { month: 'May', sales: 78, revenue: 11700 },
    { month: 'Jun', sales: 89, revenue: 13350 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Uncomment when API is ready
        // const [eventsResponse, statsResponse] = await Promise.all([
        //   eventsAPI.getMyEvents(),
        //   eventsAPI.getMyStats()
        // ]);
        
        // setEvents(eventsResponse.data);
        // setStats(statsResponse.data);

        // Using mock data for now
        setEvents(mockEvents);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching organizer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSalesPercentage = (sold, total) => {
    return total > 0 ? Math.round((sold / total) * 100) : 0;
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Uncomment when API is ready
        // await eventsAPI.delete(eventId);
        
        setEvents(prev => prev.filter(event => event.id !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
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
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTicketsSold.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'events', 'analytics'].map((tab) => (
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <Link
                  to="/events/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </div>

              {/* Recent Events */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Recent Events</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Chart */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Sales Overview</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {mockSalesData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 w-12">{data.month}</span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                              style={{ width: `${(data.sales / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-16 text-right">
                          ${data.revenue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Events</h3>
                <Link
                  to="/events/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
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
                    {events.map((event) => (
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
                            event.status === 'published' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
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
                            <Link
                              to={`/events/${event.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Eye className="h-4 w-4 inline" />
                            </Link>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
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

export default OrganizerPanel;
