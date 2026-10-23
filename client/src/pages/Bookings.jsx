import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  RefreshCw,
  Ticket,
  UserX,
  Wallet,
} from 'lucide-react';
import { bookingsAPI, paymentsAPI } from '../services/api';
import {
  bookingStatusLabel,
  formatDateTime,
  formatKes,
} from '../utils/format';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-slate-200 text-slate-700',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'pending', label: 'Pending' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
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
      setError(err?.message || 'Bookings could not be loaded.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const replaceBooking = (updated) => {
    setBookings((current) => current.map((booking) => (booking.id === updated.id ? updated : booking)));
  };

  const confirmBooking = async (booking) => {
    setBusyId(booking.id);
    setActionError(null);
    try {
      const result = await paymentsAPI.pay(booking.id);
      replaceBooking(result.booking || { ...booking, status: 'confirmed' });
    } catch (err) {
      setActionError(err?.message || 'The booking could not be confirmed.');
    } finally {
      setBusyId(null);
    }
  };

  const cancelBooking = async (booking) => {
    setBusyId(booking.id);
    setActionError(null);
    try {
      const result = await bookingsAPI.cancel(booking.id);
      replaceBooking(result || { ...booking, status: 'cancelled' });
      setConfirmCancelId(null);
    } catch (err) {
      setActionError(err?.message || 'The booking could not be cancelled.');
    } finally {
      setBusyId(null);
    }
  };

  const now = Date.now();
  const stats = useMemo(() => {
    const active = bookings.filter((booking) => booking.status !== 'cancelled');
    const upcoming = active.filter(
      (booking) => booking.event?.date && new Date(booking.event.date).getTime() > now
    );
    const confirmedSpend = bookings
      .filter((booking) => booking.status === 'confirmed')
      .reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);
    return {
      upcoming: upcoming.length,
      tickets: upcoming.reduce((sum, booking) => sum + Number(booking.tickets_count || 0), 0),
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmedSpend,
    };
  }, [bookings, now]);

  const visible = useMemo(() => {
    return bookings.filter((booking) => {
      const eventTime = booking.event?.date ? new Date(booking.event.date).getTime() : NaN;
      if (filter === 'pending') return booking.status === 'pending';
      if (filter === 'cancelled') return booking.status === 'cancelled';
      if (filter === 'upcoming') {
        return booking.status !== 'cancelled' && Number.isFinite(eventTime) && eventTime > now;
      }
      if (filter === 'past') {
        return booking.status !== 'cancelled' && Number.isFinite(eventTime) && eventTime <= now;
      }
      return true;
    });
  }, [bookings, filter, now]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Your tickets</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My bookings</h1>
          <p className="mt-2 text-slate-600">
            Every booking below comes from the LERA API. Pending bookings keep their seats
            reserved until you confirm or cancel them.
          </p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Find more events
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming bookings</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.upcoming}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming tickets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.tickets}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed spend</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatKes(stats.confirmedSpend)}</p>
        </div>
      </div>

      {actionError && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === option.value
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="mt-5">
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-600" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
            Loading your bookings…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
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

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Ticket className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">No bookings yet</h2>
            <p className="mt-1 text-slate-600">Find an event and reserve your first seats.</p>
            <Link to="/events" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Browse events
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-800">No bookings in this view</p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Show all bookings
            </button>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <ul className="space-y-4">
            {visible.map((booking) => {
              const event = booking.event;
              const isPast = event?.date ? new Date(event.date).getTime() <= now : false;
              const isBusy = busyId === booking.id;
              return (
                <li key={booking.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>
                          {bookingStatusLabel(booking.status)}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500">{booking.reference}</span>
                        {isPast && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Event ended</span>}
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-slate-900">
                        {event?.title || `Event #${booking.event_id}`}
                      </h2>

                      <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {event?.date ? formatDateTime(event.date) : 'Date unavailable'}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {event?.location || 'Location unavailable'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {booking.tickets_count} ticket{booking.tickets_count === 1 ? '' : 's'}
                          <span className="text-slate-400">·</span>
                          <Wallet className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {Number(booking.total_price) > 0 ? formatKes(booking.total_price) : 'Free'}
                        </p>
                        {booking.special_requests && (
                          <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                            Request: {booking.special_requests}
                          </p>
                        )}
                      </div>

                      {event?.id && (
                        <Link
                          to={`/events/${event.id}`}
                          className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View event details
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-shrink-0 flex-wrap gap-2 sm:justify-end">
                      {booking.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => confirmBooking(booking)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
                          Confirm
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Confirmed
                        </span>
                      )}

                      {booking.status !== 'cancelled' && (
                        confirmCancelId === booking.id ? (
                          <span className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-1">
                            <button
                              type="button"
                              onClick={() => cancelBooking(booking)}
                              disabled={isBusy}
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {isBusy ? 'Cancelling…' : 'Yes, cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(null)}
                              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                            >
                              Keep
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(booking.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <UserX className="h-4 w-4" aria-hidden="true" />
                            Cancel
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs leading-5 text-slate-500">
        Confirming a booking calls the project&apos;s payment endpoint, which marks the booking as
        confirmed. No card processor is connected, so no card is charged.
      </p>
    </div>
  );
};

export default Bookings;
