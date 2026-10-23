import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { eventsAPI } from '../../services/api';
import { formatShortDate, formatKes, normalizeEvent } from '../../utils/format';
import EventImage from '../events/EventImage';

const statusFor = (event) => {
  if (event.isPast) return { label: 'Ended', className: 'bg-slate-200 text-slate-700' };
  if (event.isSoldOut) return { label: 'Sold out', className: 'bg-red-100 text-red-800' };
  return { label: 'On sale', className: 'bg-emerald-100 text-emerald-800' };
};

const OrganizerPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventsAPI.getMyEvents({ signal });
      setEvents((Array.isArray(result) ? result : []).map(normalizeEvent).filter(Boolean));
    } catch (err) {
      if (err?.isCanceled) return;
      setEvents([]);
      setError(err?.message || 'Your events could not be loaded.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const stats = useMemo(() => {
    const totalTickets = events.reduce((sum, event) => sum + event.ticketsSold, 0);
    const revenue = events.reduce((sum, event) => sum + event.revenue, 0);
    return {
      totalEvents: events.length,
      upcomingEvents: events.filter((event) => !event.isPast).length,
      totalTickets,
      revenue,
    };
  }, [events]);

  const topEvents = useMemo(
    () => [...events].sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 4),
    [events]
  );

  const handleDelete = async (event) => {
    setDeletingId(event.id);
    setActionError(null);
    try {
      await eventsAPI.delete(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setConfirmId(null);
    } catch (err) {
      setActionError(err?.message || 'The event could not be deleted.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
        Loading your events…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-red-900">Events could not be loaded</p>
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
      )}

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total events', value: stats.totalEvents, icon: CalendarDays, color: 'text-indigo-700 bg-indigo-100' },
          { label: 'Upcoming events', value: stats.upcomingEvents, icon: Clock, color: 'text-emerald-700 bg-emerald-100' },
          { label: 'Tickets sold', value: stats.totalTickets.toLocaleString(), icon: Ticket, color: 'text-purple-700 bg-purple-100' },
          { label: 'Booking value', value: formatKes(stats.revenue), icon: Wallet, color: 'text-amber-700 bg-amber-100' },
        ].map((stat) => {
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
            {['overview', 'events'].map((tab) => (
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create event
            </Link>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-7 p-5">
            <section>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Recent events</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Manage all
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {events.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <Ticket className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                  <p className="mt-2 font-medium text-slate-800">You have not published an event yet</p>
                  <Link to="/events/create" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    Publish your first event
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {events.slice(0, 3).map((event) => {
                    const status = statusFor(event);
                    return (
                      <div key={event.id} className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="h-24">
                          <EventImage src={event.imageUrl} alt={event.title} category={event.category} iconClassName="h-8 w-8" />
                        </div>
                        <div className="p-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
                          <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">{event.title}</h3>
                          <p className="mt-1 text-xs text-slate-500">{formatShortDate(event.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {events.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <BarChart3 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  Tickets sold by event
                </h2>
                <div className="mt-4 space-y-4">
                  {topEvents.map((event) => {
                    const percentage = event.capacity > 0
                      ? Math.min(Math.round((event.ticketsSold / event.capacity) * 100), 100)
                      : 0;
                    return (
                      <div key={event.id}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="line-clamp-1 font-medium text-slate-800">{event.title}</span>
                          <span className="flex-shrink-0 text-slate-500">
                            {event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percentage}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {percentage}% of capacity · {formatKes(event.revenue)} booking value
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {events.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Seats reserved
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {events.reduce((sum, event) => sum + event.reservedSeats, 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    Average fill rate
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {Math.round(
                      events.reduce(
                        (sum, event) => sum + (event.capacity ? event.ticketsSold / event.capacity : 0),
                        0
                      ) / events.length * 100
                    )}%
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Sold-out events
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {events.filter((event) => event.isSoldOut).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-5">
            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="font-medium text-slate-800">No events to manage</p>
                <Link to="/events/create" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                  Create an event
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th scope="col" className="py-3 pr-4">Event</th>
                      <th scope="col" className="py-3 pr-4">Date</th>
                      <th scope="col" className="py-3 pr-4">Sold</th>
                      <th scope="col" className="py-3 pr-4">Booking value</th>
                      <th scope="col" className="py-3 pr-4">Status</th>
                      <th scope="col" className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((event) => {
                      const status = statusFor(event);
                      return (
                        <tr key={event.id}>
                          <td className="py-3 pr-4">
                            <Link to={`/events/${event.id}`} className="font-medium text-slate-900 hover:text-indigo-700">
                              {event.title}
                            </Link>
                            <p className="text-xs text-slate-500">{event.location}</p>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{formatShortDate(event.date)}</td>
                          <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                            {event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{formatKes(event.revenue)}</td>
                          <td className="whitespace-nowrap py-3 pr-4">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/events/${event.id}/edit`}
                                className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                                aria-label={`Edit ${event.title}`}
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </Link>
                              {confirmId === event.id ? (
                                <span className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(event)}
                                    disabled={deletingId === event.id}
                                    className="rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                  >
                                    {deletingId === event.id ? 'Deleting…' : 'Confirm'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmId(null)}
                                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmId(event.id)}
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                  aria-label={`Delete ${event.title}`}
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 text-xs text-slate-500">
              Booking value is the sum of non-cancelled bookings recorded by the API. Deleting an
              event also removes its bookings and reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerPanel;
