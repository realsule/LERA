import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Sparkles, Star, Ticket, Users } from 'lucide-react';
import EventImage from './EventImage';
import {
  categoryLabel,
  formatPriceLabel,
  formatShortDate,
  formatTime,
  normalizeEvent,
  truncate,
} from '../../utils/format';

const availability = (event) => {
  if (event.isPast) {
    return { label: 'Event ended', className: 'bg-slate-800/90 text-white' };
  }
  if (event.isSoldOut) {
    return { label: 'Sold out', className: 'bg-red-600/95 text-white' };
  }
  if (event.capacity > 0 && event.availableTickets / event.capacity <= 0.15) {
    return { label: 'Few seats left', className: 'bg-amber-500/95 text-white' };
  }
  return { label: 'On sale', className: 'bg-emerald-600/95 text-white' };
};

const EventCard = ({ event: rawEvent, reason, compact = false }) => {
  const event = normalizeEvent(rawEvent);
  if (!event) return null;

  const status = availability(event);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      data-testid="event-card"
    >
      <div className="relative h-44 overflow-hidden">
        <EventImage src={event.imageUrl} alt={event.title} category={event.category} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
            {categoryLabel(event.category)}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-indigo-600">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <span>
            {formatShortDate(event.date)}
            {event.date ? ` · ${formatTime(event.date)}` : ''}
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
          <Link
            to={`/events/${event.id}`}
            className="rounded transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {event.title}
          </Link>
        </h3>

        {event.description && (
          <p className={`mt-2 text-sm leading-6 text-slate-600 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {truncate(event.description, compact ? 110 : 165)}
          </p>
        )}

        {reason && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-800">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{reason}</span>
          </div>
        )}

        <dl className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="sr-only">Location</dt>
              <dd>{event.location}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <dt className="sr-only">Time</dt>
            <dd>{event.date ? formatTime(event.date) : 'Time to be announced'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
              {event.availableTickets.toLocaleString()} / {event.capacity.toLocaleString()} available
            </span>
            {event.reviewCount > 0 && event.rating != null && (
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                {event.rating.toFixed(1)}
                <span className="text-slate-500">({event.reviewCount})</span>
              </span>
            )}
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">From</p>
            <p className="text-lg font-bold text-slate-900">{formatPriceLabel(event.price)}</p>
          </div>
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label={`View details for ${event.title}`}
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
