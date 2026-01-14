import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Ticket, 
  Calendar, 
  Plus,
  ChevronDown,
  Search
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Events', path: '/events', icon: Ticket },
    { name: 'About', path: '/about', icon: null },
    { name: 'Contact', path: '/contact', icon: null },
  ];

  const organizerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: null },
    { name: 'Create Event', path: '/events/create', icon: Plus },
    { name: 'My Events', path: '/events/my-events', icon: Calendar },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LERA</span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActivePath(link.path)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Organizer-specific links */}
              {isAuthenticated() && hasRole('organizer') && (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200">
                    <span>Organizer</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {organizerLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        >
                          {link.icon && <link.icon className="h-4 w-4" />}
                          <span>{link.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200">
                <Search className="h-5 w-5" />
              </button>

              {/* Authenticated User */}
              {isAuthenticated() ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        {hasRole('admin') && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <User className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest User */
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LERA</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActivePath(link.path)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Organizer Links */}
              {isAuthenticated() && hasRole('organizer') && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Organizer
                    </p>
                    {organizerLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        {link.icon && <link.icon className="h-4 w-4" />}
                        <span>{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Auth Section */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated() ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
