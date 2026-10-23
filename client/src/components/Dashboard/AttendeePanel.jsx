import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Loader2,
  MapPin,
  RefreshCw,
  Ticket,
  Wallet,
} from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { bookingStatusLabel, formatDateTime, formatKes } from '../../utils/format';
import RecommendationSection from '../events/RecommendationSection';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-slate-200 text-slate-700',
};

const AttendeePanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingsAPI.getAll({ signal });
      setBookings(Array.isArray(result) ? result : []);
    } catch (err) {
      if (err?.isCanceled) return;
      setBookings([]);
      setError(err?.message || 'Your bookings could not be loaded.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const now = Date.now();
  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status !== 'cancelled' &&
            booking.event?.date &&
            new Date(booking.event.date).getTime() > now
        )
        .sort((a, b) => new Date(a.event.date) - new Date(b.event.date)),
    [bookings, now]
  );

  const confirmedSpend = bookings
    .filter((booking) => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);
  const upcomingTickets = upcoming.reduce((sum, booking) => sum + Number(booking.tickets_count || 0), 0);
  const needsConfirmation = bookings.filter((booking) => booking.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
        Loading your bookings…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-red-900">Bookings could not be loaded</p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming bookings</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{upcoming.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming tickets</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{upcomingTickets}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Needs confirmation</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{needsConfirmation.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed spend</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatKes(confirmedSpend)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Your next events</h2>
            <Link to="/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              All bookings
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <Ticket className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-2 font-medium text-slate-800">No upcoming bookings</p>
              <p className="mt-1 text-sm text-slate-600">Find an event that fits your plans.</p>
              <Link to="/events" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Browse events
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.slice(0, 4).map((booking) => (
                <li key={booking.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>
                      {bookingStatusLabel(booking.status)}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{booking.reference}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">
                    {booking.event?.title || `Event #${booking.event_id}`}
                  </p>
                  <div className="mt-1 space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      {booking.event?.date ? formatDateTime(booking.event.date) : 'Date unavailable'}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      {booking.event?.location || 'Location unavailable'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="flex items-center gap-2 text-indigo-800">
              <Wallet className="h-5 w-5" aria-hidden="true" />
              <h2 className="font-semibold">Quick links</h2>
            </div>
            <div className="mt-4 space-y-2">
              <Link to="/events" className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:text-indigo-700">
                Discover events
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/bookings" className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:text-indigo-700">
                Manage tickets
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {needsConfirmation.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-semibold">You have bookings to confirm</p>
              <p className="mt-1">
                {needsConfirmation.length} booking{needsConfirmation.length === 1 ? '' : 's'} still pending.
                Confirm them to finalise your tickets.
              </p>
              <Link to="/bookings" className="mt-3 inline-flex rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                Review bookings
              </Link>
            </div>
          )}
        </aside>
      </div>

      <RecommendationSection
        limit={3}
        compact
        title="Picked for you"
        description="Recommendations are based on the categories you book and the preferences you set."
      />
    </div>
  );
};

export default AttendeePanel;
