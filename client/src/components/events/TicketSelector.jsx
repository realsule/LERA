import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, paymentsAPI } from '../../services/api';
import {
  formatDateTime,
  formatKes,
  formatPriceLabel,
  normalizeEvent,
} from '../../utils/format';

const MAX_PER_BOOKING = 10;

const TicketSelector = ({ event: rawEvent, onBooked }) => {
  const event = normalizeEvent(rawEvent);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  if (!event) return null;

  const maxQuantity = Math.max(Math.min(event.availableTickets, MAX_PER_BOOKING), 1);
  const canBook = !event.isPast && !event.isSoldOut && event.availableTickets > 0;
  const total = event.price * quantity;
  const displayTotal = total > 0 ? formatKes(total) : 'Free';

  const changeQuantity = (delta) => {
    setQuantity((current) => Math.min(Math.max(current + delta, 1), maxQuantity));
  };

  const createBooking = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!canBook || submitting || !accepted) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await bookingsAPI.create({
        event_id: event.id,
        tickets_count: quantity,
        special_requests: specialRequests.trim() || null,
      });
      setBooking(created);
      onBooked?.(created);
    } catch (err) {
      setError(err?.message || 'The booking could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmBooking = async () => {
    if (!booking || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      const result = await paymentsAPI.pay(booking.id);
      setBooking(result.booking || { ...booking, status: 'confirmed' });
      onBooked?.(result.booking);
    } catch (err) {
      setError(err?.message || 'The booking could not be confirmed.');
    } finally {
      setConfirming(false);
    }
  };

  if (booking) {
    const isConfirmed = booking.status === 'confirmed';
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${isConfirmed ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
            {isConfirmed ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-700" aria-hidden="true" />
            ) : (
              <Ticket className="h-6 w-6 text-indigo-700" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isConfirmed ? 'Booking confirmed' : 'Seats reserved'}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {isConfirmed
                ? 'Your booking is confirmed on the server and your seats are secured.'
                : 'Your booking is pending confirmation. The seats are held while it is pending.'}
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Reference</dt>
            <dd className="font-mono font-semibold text-slate-900">{booking.reference}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Tickets</dt>
            <dd className="font-medium text-slate-900">{booking.tickets_count}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Total</dt>
            <dd className="font-semibold text-slate-900">
              {Number(booking.total_price) > 0 ? formatKes(booking.total_price) : 'Free'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium capitalize text-slate-900">{booking.status}</dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 space-y-2">
          {!isConfirmed && (
            <button
              type="button"
              onClick={confirmBooking}
              disabled={confirming}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              )}
              {confirming ? 'Confirming…' : 'Confirm booking'}
            </button>
          )}
          <Link
            to="/bookings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            View my bookings
          </Link>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          This project has no card processor connected. Confirming calls the server
          and marks the booking as confirmed; no card is charged.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={createBooking}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label={`Book tickets for ${event.title}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5">
          <Ticket className="h-6 w-6 text-indigo-700" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Book your tickets</h2>
          <p className="mt-1 text-sm text-slate-600">{formatPriceLabel(event.price)} per ticket</p>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span>{formatDateTime(event.date)}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span>{event.location}</span>
        </p>
        <p className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span>{event.availableTickets.toLocaleString()} seats available</span>
        </p>
      </div>

      {!canBook && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {event.isPast
                ? 'This event has already taken place, so bookings are closed.'
                : 'This event is sold out.'}
            </span>
          </p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm text-indigo-900">
            Sign in to reserve seats for this event.
          </p>
          <Link
            to="/login"
            state={{ from: location }}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Sign in to book
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Tickets</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeQuantity(-1)}
                  disabled={quantity <= 1 || !canBook}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Remove one ticket"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-base font-semibold text-slate-900" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQuantity(1)}
                  disabled={quantity >= maxQuantity || !canBook}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Add one ticket"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Up to {maxQuantity} ticket{maxQuantity === 1 ? '' : 's'} per booking.
            </p>
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Special requests <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <textarea
              value={specialRequests}
              onChange={(changeEvent) => setSpecialRequests(changeEvent.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Accessibility needs, group seating…"
            />
          </label>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <span className="text-sm font-medium text-slate-700">Total</span>
            <span className="text-xl font-bold text-slate-900">{displayTotal}</span>
          </div>

          <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(changeEvent) => setAccepted(changeEvent.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I understand this reserves seats and that the booking stays pending until I
              confirm it.
            </span>
          </label>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canBook || !accepted || submitting}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? 'Reserving seats…' : 'Reserve seats'}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            Signed in as {user?.username}.
          </p>
        </>
      )}
    </form>
  );
};

export default TicketSelector;
