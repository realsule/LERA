import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Share2,
  Star,
  Ticket,
  Users,
} from 'lucide-react';
import EventImage from '../components/events/EventImage';
import TicketSelector from '../components/events/TicketSelector';
import RecommendationSection from '../components/events/RecommendationSection';
import { eventsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  categoryLabel,
  formatDateTime,
  formatPriceLabel,
  formatShortDate,
  formatTime,
  normalizeEvent,
} from '../utils/format';

const EventDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [shareMessage, setShareMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFormError, setReviewFormError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventsAPI.getById(id, { signal });
      setEvent(normalizeEvent(result));
    } catch (err) {
      if (err?.isCanceled) return;
      setEvent(null);
      setError(
        err?.status === 404
          ? 'This event does not exist or has been removed.'
          : err?.message || 'The event could not be loaded.'
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }

    try {
      const reviewResult = await reviewsAPI.getForEvent(id, { signal });
      setReviews(Array.isArray(reviewResult) ? reviewResult : []);
      setReviewError(null);
    } catch (err) {
      if (!err?.isCanceled) {
        setReviews([]);
        setReviewError(err?.message || 'Reviews could not be loaded.');
      }
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const handleShare = async () => {
    const shareData = {
      title: event?.title || 'LERA event',
      text: event?.description ? event.description.slice(0, 120) : 'View this event on LERA',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Shared.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Event link copied.');
      } else {
        setShareMessage('Copy the address bar to share this event.');
      }
    } catch {
      setShareMessage('Sharing was cancelled.');
    }
  };

  const submitReview = async (submitEvent) => {
    submitEvent.preventDefault();
    if (reviewSubmitting) return;
    setReviewSubmitting(true);
    setReviewFormError(null);
    try {
      await reviewsAPI.create({
        event_id: Number(id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });
      setReviewForm({ rating: 5, comment: '' });
      setReloadKey((key) => key + 1);
    } catch (err) {
      setReviewFormError(err?.message || 'Your review could not be saved.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const canManage =
    user && event && (user.role === 'admin' || Number(user.id) === Number(event.organizerId));
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : event?.rating;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" role="status">
        <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
        <span className="sr-only">Loading event details…</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-14 w-14 text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Event not available</h1>
        <p className="mt-2 text-slate-600">{error || 'The event could not be found.'}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const status = event.isPast
    ? { label: 'Event ended', className: 'bg-slate-800 text-white' }
    : event.isSoldOut
      ? { label: 'Sold out', className: 'bg-red-600 text-white' }
      : { label: 'On sale', className: 'bg-emerald-600 text-white' };

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to events
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <Link
                to={`/events/${event.id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit event
              </Link>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {shareMessage ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden="true" />
              )}
              Share
            </button>
          </div>
        </div>

        {shareMessage && (
          <p className="mb-4 rounded-xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm" role="status">
            {shareMessage}
          </p>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-64 sm:h-80">
            <EventImage
              src={event.imageUrl}
              alt={event.title}
              category={event.category}
              iconClassName="h-20 w-20"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800">
                  {categoryLabel(event.category)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
                {averageRating != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    {averageRating.toFixed(1)} ({reviews.length || event.reviewCount})
                  </span>
                )}
              </div>
              <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-slate-900">About this event</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-700">
                  {event.description || 'The organizer has not added a description yet.'}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">Event details</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <CalendarDays className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      Date
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(event.date)}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Clock className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      Start time
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-slate-900">
                      {event.date ? formatTime(event.date) : 'Time to be announced'}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <MapPin className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      Location
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-slate-900">{event.location}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Users className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      Capacity
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-slate-900">
                      {event.availableTickets.toLocaleString()} of {event.capacity.toLocaleString()} seats available
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">Organizer</h2>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {event.organizer.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{event.organizer}</p>
                    <p className="text-sm text-slate-500">Publishes events on LERA</p>
                  </div>
                </div>
              </section>

              <section id="reviews">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
                  <p className="text-sm text-slate-500">
                    {reviews.length === 0
                      ? 'No reviews yet'
                      : `${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
                  </p>
                </div>

                {reviewError && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800" role="alert">
                    {reviewError}
                  </p>
                )}

                {reviews.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {reviews.map((review) => (
                      <li key={review.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">LERA attendee</p>
                          <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${index < review.rating ? 'fill-current' : 'text-slate-200'}`}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                        </div>
                        {review.comment && <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                    Be the first to share what this event was like.
                  </p>
                )}

                {user ? (
                  <form onSubmit={submitReview} className="mt-5 rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-800">Leave a review</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="text-sm text-slate-600" htmlFor="review-rating">
                        Rating
                      </label>
                      <select
                        id="review-rating"
                        value={reviewForm.rating}
                        onChange={(changeEvent) =>
                          setReviewForm((current) => ({ ...current, rating: changeEvent.target.value }))
                        }
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} star{rating === 1 ? '' : 's'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="mt-3 block text-sm">
                      <span className="mb-1 block font-medium text-slate-700">Comment (optional)</span>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(changeEvent) =>
                          setReviewForm((current) => ({ ...current, comment: changeEvent.target.value }))
                        }
                        maxLength={2000}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>
                    {reviewFormError && (
                      <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
                        {reviewFormError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                      {reviewSubmitting ? 'Submitting…' : 'Submit review'}
                    </button>
                  </form>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">
                    <Link to="/login" state={{ from: location }} className="font-semibold text-indigo-600 hover:text-indigo-800">
                      Sign in
                    </Link>{' '}
                    to leave a review.
                  </p>
                )}
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <TicketSelector event={event} onBooked={() => setReloadKey((key) => key + 1)} />
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-slate-800">
                  <Ticket className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  Price
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPriceLabel(event.price)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  The server calculates the total from the event price. Client-supplied totals are ignored.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-10">
          <RecommendationSection
            limit={3}
            eventId={event.id}
            title="More events like this"
            description="Similar real events, ranked by category, content and availability."
            compact
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
