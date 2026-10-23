import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Brain,
  Loader2,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Wallet,
} from 'lucide-react';
import EventCard from './EventCard';
import { categoriesAPI, recommendationsAPI } from '../../services/api';
import { categoryLabel, getItems } from '../../utils/format';
import {
  getPreferences,
  hasPreferences,
  preferencesToQuery,
  sanitizePreferences,
  savePreferences,
} from '../../utils/preferences';
import { useAuth } from '../../context/AuthContext';

const BUDGET_OPTIONS = [
  { value: '', label: 'Any budget' },
  { value: '1000', label: 'Up to KES 1,000' },
  { value: '2500', label: 'Up to KES 2,500' },
  { value: '5000', label: 'Up to KES 5,000' },
  { value: '10000', label: 'Up to KES 10,000' },
  { value: '25000', label: 'Up to KES 25,000' },
];

const RecommendationSection = ({
  limit = 3,
  eventId = null,
  categories: providedCategories = null,
  title = 'Recommended for you',
  description = 'Ranked by your interests, budget, location and the events that are genuinely available.',
  compact = false,
}) => {
  const { user } = useAuth();
  const initial = useMemo(() => getPreferences(), []);
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [categories, setCategories] = useState(providedCategories || []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (providedCategories) {
      setCategories(providedCategories);
      return undefined;
    }
    const controller = new AbortController();
    categoriesAPI
      .getAll({ signal: controller.signal })
      .then((result) => setCategories(Array.isArray(result) ? result : []))
      .catch((err) => {
        if (!err?.isCanceled) setCategories([]);
      });
    return () => controller.abort();
  }, [providedCategories]);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...preferencesToQuery(applied),
          limit,
        };
        if (eventId) params.event_id = eventId;
        const result = await recommendationsAPI.get(params, { signal });
        setData(result);
      } catch (err) {
        if (err?.isCanceled) return;
        setData(null);
        setError(err?.message || 'Recommendations are unavailable right now.');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [applied, limit, eventId]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey, user?.id]);

  const toggleInterest = (name) => {
    const value = String(name || '').toLowerCase();
    setDraft((current) => {
      const selected = current.interests.includes(value);
      return {
        ...current,
        interests: selected
          ? current.interests.filter((interest) => interest !== value)
          : [...current.interests, value].slice(0, 10),
      };
    });
    setDirty(true);
  };

  const applyPreferences = () => {
    const next = savePreferences(draft);
    setDraft(next);
    setApplied(next);
    setDirty(false);
    setReloadKey((key) => key + 1);
  };

  const resetPreferences = () => {
    const next = sanitizePreferences({});
    savePreferences(next);
    setDraft(next);
    setApplied(next);
    setDirty(false);
    setReloadKey((key) => key + 1);
  };

  const items = getItems(data);
  const interestsUsed = data?.interests_used || applied.interests;
  const strategyLabel =
    data?.strategy === 'ai_rerank'
      ? 'AI-assisted reranking of real events'
      : 'Data-driven content ranking';
  const preferenceActive = hasPreferences(applied);

  return (
    <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Smart discovery
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-indigo-200 bg-white px-3 py-1 font-medium text-indigo-700">
            {strategyLabel}
          </span>
          {data?.personalized && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Tuned to your bookings
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          Your preferences
        </div>

        {categories.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Interests</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = draft.interests.includes(String(category.name).toLowerCase());
                return (
                  <button
                    key={category.id ?? category.name}
                    type="button"
                    onClick={() => toggleInterest(category.name)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
                    }`}
                  >
                    {categoryLabel(category.name)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 flex items-center gap-1.5 font-medium text-slate-700">
              <Wallet className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Budget
            </span>
            <select
              value={draft.budget ?? ''}
              onChange={(event) => {
                setDraft((current) => ({ ...current, budget: event.target.value }));
                setDirty(true);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value || 'any'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Location
            </span>
            <input
              type="text"
              value={draft.location}
              onChange={(event) => {
                setDraft((current) => ({ ...current, location: event.target.value }));
                setDirty(true);
              }}
              placeholder="e.g. Nairobi"
              maxLength={120}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={applyPreferences}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <RefreshCw className={`h-4 w-4 ${dirty ? 'text-white' : 'text-indigo-200'}`} aria-hidden="true" />
            Update recommendations
          </button>
          <button
            type="button"
            onClick={resetPreferences}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Reset
          </button>
          {dirty && (
            <span className="text-xs font-medium text-amber-700">Preferences changed — update to refresh.</span>
          )}
          {!preferenceActive && !dirty && (
            <span className="text-xs text-slate-500">Add interests to personalise your results.</span>
          )}
        </div>
      </div>

      {interestsUsed.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Ranking with: {interestsUsed.map(categoryLabel).join(', ')}
        </p>
      )}

      <div className="mt-5">
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-12 text-sm text-slate-600" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
            Finding real, available events…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-red-900">Could not load recommendations</p>
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

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Brain className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
            <p className="mt-3 font-medium text-slate-800">No matching available events yet</p>
            <p className="mt-1 text-sm text-slate-600">
              {data?.message || 'Try a wider budget, another location, or browse all events.'}
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className={`grid gap-5 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {items.map((item) => (
              <EventCard
                key={item.event_id}
                event={item.event}
                reason={item.reason}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationSection;
