import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/events/EventCardSkeleton';
import { categoriesAPI, eventsAPI } from '../services/api';
import { categoryLabel, getItems, getPagination } from '../utils/format';

const PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date: soonest first' },
  { value: 'date_desc', label: 'Date: latest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most booked' },
  { value: 'newest', label: 'Recently added' },
  { value: 'title_asc', label: 'Title: A–Z' },
];

const EMPTY_DRAFT = {
  q: '',
  category: '',
  min_price: '',
  max_price: '',
  date_from: '',
  date_to: '',
  sort: 'date_asc',
  available: false,
  includePast: false,
};

function readDraft(searchParams) {
  return {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    sort: searchParams.get('sort') || 'date_asc',
    available: searchParams.get('available') === 'true',
    includePast: searchParams.get('upcoming') === 'all',
  };
}

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState(() => readDraft(searchParams));
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchKey = searchParams.toString();
  const currentPage = Math.max(Number(searchParams.get('page')) || 1, 1);
  const applied = useMemo(() => readDraft(searchParams), [searchParams]);

  useEffect(() => {
    // Keep the editable form in sync when the URL changes (back/forward).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(readDraft(searchParams));
  }, [fetchKey, searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    categoriesAPI
      .getAll({ signal: controller.signal })
      .then((result) => {
        setCategories(Array.isArray(result) ? result : []);
        setCategoryError(null);
      })
      .catch((err) => {
        if (!err?.isCanceled) {
          setCategories([]);
          setCategoryError(err?.message || 'Categories could not be loaded.');
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(searchParams);
    if (!params.has('per_page')) params.set('per_page', String(PER_PAGE));
    if (!params.has('upcoming')) params.set('upcoming', 'true');
    if (!params.has('sort')) params.set('sort', 'date_asc');

    // Fetching a new page intentionally shows the loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    eventsAPI
      .getAll(Object.fromEntries(params), { signal: controller.signal })
      .then((result) => {
        setEvents(getItems(result));
        setPagination(getPagination(result));
      })
      .catch((err) => {
        if (err?.isCanceled) return;
        setEvents([]);
        setPagination(null);
        setError(err?.message || 'Events could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [fetchKey, reloadKey, searchParams]);

  const applyFilters = useCallback(
    (overrides = {}) => {
      const next = { ...draft, ...overrides };
      const params = new URLSearchParams();

      if (next.q.trim()) params.set('q', next.q.trim());
      if (next.category) params.set('category', next.category);
      if (next.min_price !== '') params.set('min_price', next.min_price);
      if (next.max_price !== '') params.set('max_price', next.max_price);
      if (next.date_from) params.set('date_from', next.date_from);
      if (next.date_to) params.set('date_to', next.date_to);
      if (next.sort && next.sort !== 'date_asc') params.set('sort', next.sort);
      if (next.available) params.set('available', 'true');
      params.set('upcoming', next.includePast ? 'all' : 'true');

      setSearchParams(params, { replace: false });
      setShowFilters(false);
    },
    [draft, setSearchParams]
  );

  const clearFilters = () => {
    setDraft(EMPTY_DRAFT);
    setSearchParams(new URLSearchParams(), { replace: false });
    setShowFilters(false);
  };

  const removeFilter = (key) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    // Removing any filter keeps the catalogue in its default upcoming-only
    // view. The explicit "all" value is only ever set by the include-past
    // checkbox.
    if (!params.has('upcoming')) params.set('upcoming', 'true');
    setSearchParams(params, { replace: false });
  };

  const changePage = (page) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    setSearchParams(params, { replace: false });
  };

  const totalPages = pagination?.total_pages || 1;
  const total = pagination?.total ?? events.length;
  const activeChips = [];
  if (applied.q) activeChips.push({ key: 'q', label: `Search: ${applied.q}` });
  if (applied.category) activeChips.push({ key: 'category', label: `Category: ${categoryLabel(applied.category)}` });
  if (applied.min_price) activeChips.push({ key: 'min_price', label: `Min: KES ${applied.min_price}` });
  if (applied.max_price) activeChips.push({ key: 'max_price', label: `Max: KES ${applied.max_price}` });
  if (applied.date_from) activeChips.push({ key: 'date_from', label: `From: ${applied.date_from}` });
  if (applied.date_to) activeChips.push({ key: 'date_to', label: `To: ${applied.date_to}` });
  if (applied.available) activeChips.push({ key: 'available', label: 'Available only' });
  if (applied.includePast) activeChips.push({ key: 'upcoming', label: 'Including past events' });

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const pages = new Set([1, totalPages, currentPage]);
    for (let offset = 1; offset <= 2; offset += 1) {
      if (currentPage - offset >= 1) pages.add(currentPage - offset);
      if (currentPage + offset <= totalPages) pages.add(currentPage + offset);
    }
    return [...pages].sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Event catalogue</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Explore events</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Search the live catalogue, filter by category, price and date, and see real
                remaining capacity before you book.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters({ q: draft.q });
              }}
              className="flex w-full max-w-xl gap-2"
            >
              <label htmlFor="event-search" className="sr-only">
                Search events
              </label>
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="event-search"
                  type="search"
                  value={draft.q}
                  onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))}
                  placeholder="Search title, venue or description"
                  className="w-full border-0 bg-transparent py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((visible) => !visible)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 lg:hidden"
                aria-expanded={showFilters}
                aria-controls="event-filters"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filters
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`} aria-label="Event filters">
            <div id="event-filters" className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Reset
                </button>
              </div>

              {categoryError && (
                <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{categoryError}</p>
              )}

              <div className="mt-5 space-y-4">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Category</span>
                  <select
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category.id ?? category.name} value={category.name}>
                        {categoryLabel(category.name)} ({category.event_count ?? 0})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Sort by</span>
                  <select
                    value={draft.sort}
                    onChange={(event) => setDraft((current) => ({ ...current, sort: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <fieldset>
                  <legend className="mb-1 text-sm font-medium text-slate-700">Price range (KES)</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="sr-only" htmlFor="min-price">
                      Minimum price
                    </label>
                    <input
                      id="min-price"
                      type="number"
                      min="0"
                      step="50"
                      value={draft.min_price}
                      onChange={(event) => setDraft((current) => ({ ...current, min_price: event.target.value }))}
                      placeholder="Min"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <label className="sr-only" htmlFor="max-price">
                      Maximum price
                    </label>
                    <input
                      id="max-price"
                      type="number"
                      min="0"
                      step="50"
                      value={draft.max_price}
                      onChange={(event) => setDraft((current) => ({ ...current, max_price: event.target.value }))}
                      placeholder="Max"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    Date range
                  </legend>
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-500">
                      From
                      <input
                        type="date"
                        value={draft.date_from}
                        onChange={(event) => setDraft((current) => ({ ...current, date_from: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>
                    <label className="block text-xs text-slate-500">
                      To
                      <input
                        type="date"
                        value={draft.date_to}
                        onChange={(event) => setDraft((current) => ({ ...current, date_to: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>
                  </div>
                </fieldset>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.available}
                    onChange={(event) => setDraft((current) => ({ ...current, available: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Only events with seats left
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.includePast}
                    onChange={(event) => setDraft((current) => ({ ...current, includePast: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Include past events
                </label>

                <button
                  type="button"
                  onClick={() => applyFilters()}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </aside>

          <section aria-label="Event results">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {loading ? 'Searching…' : `${total.toLocaleString()} event${total === 1 ? '' : 's'} found`}
                </h2>
                {pagination && totalPages > 1 && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
              </div>
              {!loading && !error && (
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Refresh
                </button>
              )}
            </div>

            {activeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeFilter(chip.key)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-100"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="mt-6">
              {loading && <EventCardSkeleton count={6} />}

              {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
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

              {!loading && !error && events.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Filter className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">No events match these filters</h3>
                  <p className="mt-1 text-slate-600">Try a different category, price range or search term.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {!loading && !error && events.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>

            {!loading && !error && totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                {pageNumbers.map((page, index) => {
                  const previous = pageNumbers[index - 1];
                  return (
                    <React.Fragment key={page}>
                      {previous && page - previous > 1 && <span className="px-1 text-slate-400">…</span>}
                      <button
                        type="button"
                        onClick={() => changePage(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium ${
                          page === currentPage
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
                <button
                  type="button"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}

            {loading && (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Fetching events from the LERA API…
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Events;
