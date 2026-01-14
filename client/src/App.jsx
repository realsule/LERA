import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './layout/ProtectedRoute';

function App() {
  return (
    // Router must wrap providers/components that use react-router hooks.
    <Router>
      <ErrorBoundary>
        // AuthProvider is app-wide; ProtectedRoute enforces auth/roles where needed.
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected Routes for IAM Requirements */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={['admin', 'organizer', 'attendee']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin-only routes */}
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