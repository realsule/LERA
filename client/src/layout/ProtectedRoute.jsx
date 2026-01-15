import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
