import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminPanel from '../components/Dashboard/AdminPanel';
import OrganizerPanel from '../components/Dashboard/OrganizerPanel';
import AttendeePanel from '../components/Dashboard/AttendeePanel';
import { User, Shield, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user, hasRole } = useAuth();

  const renderDashboardPanel = () => {
    if (hasRole('admin')) {
      return <AdminPanel />;
    }
    
    if (hasRole('organizer')) {
      return <OrganizerPanel />;
    }
    
    if (hasRole('attendee')) {
      return <AttendeePanel />;
    }
    
    // Fallback for users without specific roles
    return <AttendeePanel />;
  };

  const getRoleInfo = () => {
    if (hasRole('admin')) {
      return {
        title: 'Admin Dashboard',
        description: 'Manage users, events, and platform settings',
        icon: Shield,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      };
    }
    
    if (hasRole('organizer')) {
      return {
        title: 'Organizer Dashboard',
        description: 'Create events and track your ticket sales',
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }
    
    return {
      title: 'Attendee Dashboard',
      description: 'View your tickets and discover new events',
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${roleInfo.bgColor}`}>
                <Icon className={`h-6 w-6 ${roleInfo.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {roleInfo.title}
                </h1>
                <p className="text-gray-600">{roleInfo.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {renderDashboardPanel()}
      </div>
    </div>
  );
};

export default Dashboard;