import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Compass,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/events/EventCardSkeleton';
import RecommendationSection from '../components/events/RecommendationSection';
import { categoriesAPI, eventsAPI } from '../services/api';
import { getItems, getPagination, categoryLabel, daysUntil, formatKes } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const FEATURED_LIMIT = 6;

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setEventError(null);
    setCategoryError(null);

    const [eventsResult, categoriesResult] = await Promise.allSettled([
      eventsAPI.getAll(
        {
          page: 1,
          per_page: FEATURED_LIMIT,
          upcoming: 'true',
          available: 'true',
          sort: 'date_asc',
        },
        { signal }
      ),
      categoriesAPI.getAll({ signal }),
    ]);

    if (signal.aborted) return;

    if (eventsResult.status === 'fulfilled') {
      setEvents(getItems(eventsResult.value));
      setTotalEvents(getPagination(eventsResult.value).total);
    } else if (!eventsResult.reason?.isCanceled) {
      setEvents([]);
      setTotalEvents(null);
      setEventError(eventsResult.reason?.message || 'Could not load events.');
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(Array.isArray(categoriesResult.value) ? categoriesResult.value : []);
    } else if (!categoriesResult.reason?.isCanceled) {
      setCategories([]);
      setCategoryError(categoriesResult.reason?.message || 'Could not load categories.');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Data fetching intentionally enters a loading state when dependencies change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const soonest = useMemo(() => {
    if (!events.length) return null;
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [events]);

  const nextEventDays = soonest ? daysUntil(soonest.date) : null;
  const startingPrice = useMemo(() => {
    const prices = events.map((event) => Number(event.price) || 0);
    return prices.length ? Math.min(...prices) : null;
  }, [events]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/events?q=${encodeURIComponent(query)}` : '/events');
  };

  const topCategories = useMemo(
    () =>
      [...categories]
        .sort((a, b) => (b.event_count || 0) - (a.event_count || 0))
        .slice(0, 10),
    [categories]
  );

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.28),transparent_38%),radial-gradient(circle_at_60%_90%,rgba(14,165,233,0.18),transparent_40%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100 backdrop-blur">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Live event marketplace
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Find your next unforgettable event.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Real events, live seat availability and transparent pricing in Kenyan
                shillings. Discover what is on, compare what fits your budget, and book in
                minutes.
              </p>

              <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-indigo-950/40 sm:flex-row">
                <label htmlFor="home-search" className="sr-only">
                  Search events
                </label>
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  <input
                    id="home-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search events, venues or categories"
                    className="w-full border-0 bg-transparent py-3 text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Search events
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>

              <div className="mt-5 flex flex-wrap gap-2">
                {topCategories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id ?? category.name}
                    to={`/events?category=${encodeURIComponent(category.name)}`}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10"
                  >
                    {categoryLabel(category.name)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-indigo-200">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Upcoming events</span>
                </div>
                <p className="mt-3 text-3xl font-bold">
                  {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-white/20" /> : totalEvents ?? '—'}
                </p>
                <p className="mt-1 text-sm text-slate-400">Currently listed and available</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Compass className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Categories</span>
                </div>
                <p className="mt-3 text-3xl font-bold">
                  {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-white/20" /> : categories.length || '—'}
                </p>
                <p className="mt-1 text-sm text-slate-400">Ways to find something you love</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Wallet className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Starting from</span>
                </div>
                <p className="mt-3 text-3xl font-bold">
                  {loading ? (
                    <span className="inline-block h-8 w-24 animate-pulse rounded bg-white/20" />
                  ) : startingPrice != null ? (
                    formatKes(startingPrice)
                  ) : (
                    '—'
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {nextEventDays != null && nextEventDays >= 0
                    ? `Next event in ${nextEventDays} day${nextEventDays === 1 ? '' : 's'}`
                    : 'Across available events'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6 lg:px-8">
        <section aria-labelledby="featured-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Happening soon</p>
              <h2 id="featured-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Featured events
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                The next real events with seats still available, ordered by date.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Browse all events
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7">
            {loading && <EventCardSkeleton count={3} />}

            {!loading && eventError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-red-900">Events could not be loaded</p>
                    <p className="mt-1 text-sm text-red-700">{eventError}</p>
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

            {!loading && !eventError && events.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Ticket className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-lg font-semibold text-slate-900">No upcoming events are listed yet</p>
                <p className="mt-1 text-slate-600">Check back soon or create the first event.</p>
                <Link
                  to={isAuthenticated && hasAnyRole(['organizer', 'admin']) ? '/events/create' : '/register'}
                  className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {isAuthenticated && hasAnyRole(['organizer', 'admin']) ? 'Create an event' : 'Become an organizer'}
                </Link>
              </div>
            )}

            {!loading && !eventError && events.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </section>

        <RecommendationSection
          limit={3}
          categories={categories}
          title="Events picked for your taste"
          description="Turn on a few interests and set a budget. The server ranks real, available events and explains each match."
        />

        <section aria-labelledby="categories-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Explore</p>
              <h2 id="categories-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Browse by category
              </h2>
              <p className="mt-2 text-slate-600">Counts come directly from the live event catalogue.</p>
            </div>
          </div>

          {categoryError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{categoryError}</span>
            </div>
          )}

          {!categoryError && topCategories.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {topCategories.map((category) => (
                <Link
                  key={category.id ?? category.name}
                  to={`/events?category=${encodeURIComponent(category.name)}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{categoryLabel(category.name)}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {category.event_count === 1 ? '1 event' : `${category.event_count || 0} events`}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {!categoryError && !loading && topCategories.length === 0 && (
            <p className="mt-5 rounded-xl bg-white p-5 text-sm text-slate-600">No categories have been created yet.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 p-8 text-white sm:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                For organizers
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Host your next event on LERA</h2>
              <p className="mt-2 max-w-2xl text-indigo-100">
                Publish real capacity and pricing, manage bookings, and follow attendance
                from your organizer dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={isAuthenticated && hasAnyRole(['organizer', 'admin']) ? '/events/create' : '/register'}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                {isAuthenticated && hasAnyRole(['organizer', 'admin']) ? 'Create an event' : 'Create an account'}
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Explore events
              </Link>
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading live catalogue data…
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
