/**
 * AttendeePanel Component
 * 
 * Provides event attendees with a personalized dashboard to view their tickets,
 * discover new events, and track their event participation history.
 * Features quick stats, event browsing, and ticket management.
 * 
 * @component
 * @returns {JSX.Element} Attendee dashboard interface
 */
import React from 'react';

const AttendeePanel = () => {
  return (
    <div className="space-y-6">
      {/* Main dashboard container with welcome message */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🎫 Attendee Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Welcome to your personal event hub! Here you can manage your tickets and discover new events.
        </p>
        
        {/* Statistics cards showing attendee metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Events Card */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-full">
                <span className="text-white text-2xl font-bold">5</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
                <p className="text-gray-600">Events you're attending</p>
              </div>
            </div>
          </div>
          
          {/* Total Tickets Card */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-full">
                <span className="text-white text-2xl font-bold">12</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Tickets</h3>
                <p className="text-gray-600">Tickets purchased</p>
              </div>
            </div>
          </div>
          
          {/* Total Spent Card */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600 rounded-full">
                <span className="text-white text-2xl font-bold">$450</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
                <p className="text-gray-600">On events</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons for common attendee tasks */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Browse Events Button */}
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
              🎟 Browse Events
            </button>
            {/* My Tickets Button */}
            <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
              🎫 My Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeePanel;
