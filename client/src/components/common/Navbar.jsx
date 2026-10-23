import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PUBLIC_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'About', path: '/about' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout, hasAnyRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const initials = (user?.username || user?.email || 'L').slice(0, 2).toUpperCase();
  const isOrganizer = hasAnyRole(['organizer', 'admin']);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Ticket className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">LERA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                aria-current={isActive('/dashboard') ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              {isOrganizer && (
                <Link
                  to="/events/create"
                  aria-current={isActive('/events/create') ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive('/events/create')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create event
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {initials}
                </span>
                <span className="hidden max-w-32 truncate font-medium text-slate-800 sm:block">{user?.username}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" role="menu" onClick={() => setProfileOpen(false)}>
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.username}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                      {user?.role}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <Link to="/dashboard" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Dashboard
                    </Link>
                    <Link to="/bookings" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Ticket className="h-4 w-4" aria-hidden="true" />
                      My bookings
                    </Link>
                    {isOrganizer && (
                      <Link to="/events/create" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        Create event
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create account
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-50 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white md:hidden" onClick={() => setMenuOpen(false)}>
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4" aria-label="Mobile">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link.path) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Dashboard
                </Link>
                <Link to="/bookings" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  My bookings
                </Link>
                {isOrganizer && (
                  <Link to="/events/create" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Create event
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Admin dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid gap-2 pt-2">
                <Link to="/login" className="rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Create account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
