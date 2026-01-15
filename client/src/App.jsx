import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import About from './pages/About';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './layout/ProtectedRoute';
import { checkHealth } from './services/api';

/**
 * Main App Component
 * 
 * This is the root component of the LERA frontend application.
 * It sets up the entire application structure including:
 * - React Router for navigation
 * - Authentication context for user state management
 * - Error boundaries for graceful error handling
 * - Layout components (Navbar, Footer)
 * - Route definitions for all pages
 * 
 * The component follows a hierarchical structure:
 * Router > ErrorBoundary > AuthProvider > Layout > Routes
 * 
 * Router wraps everything to provide routing context
 * ErrorBoundary catches and handles component errors
 * AuthProvider provides authentication state throughout the app
 * ProtectedRoute components guard routes that require authentication
 */

function App() {
  // Check backend health on app load
  useEffect(() => {
    checkHealth().catch((error) => {
      // Silently handle health check errors - Footer will show status
      console.warn('Initial health check failed:', error);
    });
  }, []);

  return (
    // Router must wrap providers/components that use react-router hooks.
    // This ensures useNavigate, useParams, etc. work throughout the app.
    <Router>
      <ErrorBoundary>
        {/* AuthProvider is app-wide; ProtectedRoute enforces auth/roles where needed */}
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                {/* Public routes - accessible to all users */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected Routes for IAM Requirements */}
                {/* These routes require authentication and specific user roles */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={['admin', 'organizer', 'attendee']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin-only routes - highest privilege level */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
