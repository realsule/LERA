/**
 * Visitor preference storage.
 *
 * Preferences are intentionally stored in the browser only. They personalise
 * the deterministic recommendation endpoint and are never used as a substitute
 * for server-side authorisation. No account, e-mail or booking data is kept
 * here.
 */
export const PREFERENCES_KEY = 'lera:preferences:v1';

export const DEFAULT_PREFERENCES = {
  interests: [],
  budget: null,
  location: '',
};

function storageAvailable() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function normalizeInterest(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .slice(0, 40);
}

export function sanitizePreferences(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const interests = Array.isArray(source.interests)
    ? [...new Set(source.interests.map(normalizeInterest).filter(Boolean))].slice(0, 10)
    : [];

  const budgetNumber = Number(source.budget);
  const budget =
    source.budget === '' || source.budget == null || !Number.isFinite(budgetNumber)
      ? null
      : Math.max(budgetNumber, 0);

  return {
    interests,
    budget,
    location: String(source.location || '').trim().slice(0, 120),
  };
}

export function getPreferences() {
  if (!storageAvailable()) return { ...DEFAULT_PREFERENCES };
  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return { ...DEFAULT_PREFERENCES };
    return sanitizePreferences(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(next) {
  const preferences = sanitizePreferences(next);
  if (storageAvailable()) {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      // A full or disabled storage area should never break event discovery.
    }
  }
  return preferences;
}

export function clearPreferences() {
  if (storageAvailable()) {
    try {
      window.localStorage.removeItem(PREFERENCES_KEY);
    } catch {
      // Ignore storage failures.
    }
  }
  return { ...DEFAULT_PREFERENCES };
}

export function hasPreferences(preferences) {
  if (!preferences) return false;
  return (
    preferences.interests.length > 0 ||
    preferences.budget != null ||
    Boolean(preferences.location)
  );
}

export function preferencesToQuery(preferences) {
  const safe = sanitizePreferences(preferences);
  const params = {};
  if (safe.interests.length) params.interests = safe.interests.join(',');
  if (safe.budget != null) params.budget = safe.budget;
  if (safe.location) params.location = safe.location;
  return params;
}
