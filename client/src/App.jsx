import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/layout/ProtectedRoute';
import './assets/styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/events/:id" element={<EventDetail />} />
            
            {/* Protected Routes for IAM Requirements */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['admin', 'organizer', 'attendee']}>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;