import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatShortDate, formatKes, normalizeEvent } from '../../utils/format';

const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-800',
  organizer: 'bg-indigo-100 text-indigo-800',
  attendee: 'bg-emerald-100 text-emerald-800',
};

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsResult, usersResult, eventsResult] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getUsers(),
        adminAPI.getEvents(),
      ]);
      setAnalytics(analyticsResult);
      setUsers(Array.isArray(usersResult) ? usersResult : []);
      setEvents((Array.isArray(eventsResult) ? eventsResult : []).map(normalizeEvent).filter(Boolean));
    } catch (err) {
      if (err?.isCanceled) return;
      setError(err?.message || 'Admin data could not be loaded.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  const filteredEvents = useMemo(() => {
    const term = eventSearch.trim().toLowerCase();
    if (!term) return events;
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term) ||
        event.organizer.toLowerCase().includes(term)
    );
  }, [events, eventSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
        Loading platform data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-red-900">Admin data could not be loaded</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Users', value: analytics?.total_users ?? users.length, icon: Users, color: 'text-indigo-700 bg-indigo-100' },
    { label: 'Events', value: analytics?.total_events ?? events.length, icon: CalendarDays, color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Upcoming events', value: analytics?.upcoming_events ?? events.filter((event) => !event.isPast).length, icon: BarChart3, color: 'text-purple-700 bg-purple-100' },
    { label: 'Booking value', value: formatKes(analytics?.booking_value ?? 0), icon: Wallet, color: 'text-amber-700 bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {['overview', 'users', 'events'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
                className={`rounded-lg px-3 py-2 text-sm font-medium capitalize ${
                  activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:self-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 p-5">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>
                  This dashboard is read-only. The current API exposes analytics, users and events,
                  but no user-suspension or event-approval endpoints, so those controls are not shown.
                </span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Categories', value: analytics?.total_categories ?? 0 },
                { label: 'Active bookings', value: analytics?.total_bookings ?? 0 },
                { label: 'Seats reserved', value: (analytics?.tickets_reserved ?? 0).toLocaleString() },
                { label: 'Confirmed booking value', value: formatKes(analytics?.booking_value ?? 0) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">Latest events</h2>
              {events.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                  No events have been published yet.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {[...events]
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 5)
                    .map((event) => (
                      <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div>
                          <Link to={`/events/${event.id}`} className="font-medium text-slate-900 hover:text-indigo-700">
                            {event.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {event.organizer} · {formatShortDate(event.date)}
                          </p>
                        </div>
                        <span className="text-sm text-slate-600">
                          {event.ticketsSold.toLocaleString()} sold
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-slate-900">Users ({filteredUsers.length})</h2>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="py-3 pr-4">User</th>
                    <th scope="col" className="py-3 pr-4">Email</th>
                    <th scope="col" className="py-3 pr-4">Role</th>
                    <th scope="col" className="py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{user.username}</td>
                      <td className="py-3 pr-4 text-slate-600">{user.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ROLE_STYLES[user.role] || ROLE_STYLES.attendee}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">No users match this search.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-slate-900">Events ({filteredEvents.length})</h2>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={eventSearch}
                  onChange={(event) => setEventSearch(event.target.value)}
                  placeholder="Search events"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="py-3 pr-4">Event</th>
                    <th scope="col" className="py-3 pr-4">Organizer</th>
                    <th scope="col" className="py-3 pr-4">Date</th>
                    <th scope="col" className="py-3 pr-4">Sold</th>
                    <th scope="col" className="py-3">Booking value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="py-3 pr-4">
                        <Link to={`/events/${event.id}`} className="font-medium text-slate-900 hover:text-indigo-700">
                          {event.title}
                        </Link>
                        <p className="text-xs text-slate-500">{event.location}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{event.organizer}</td>
                      <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{formatShortDate(event.date)}</td>
                      <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                        {event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap py-3 text-slate-600">{formatKes(event.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEvents.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">No events match this search.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
