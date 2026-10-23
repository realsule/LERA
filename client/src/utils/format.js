const KES_FORMATTER = new Intl.NumberFormat('en-KE', {
  maximumFractionDigits: 0,
});

export function formatKes(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'KES 0';
  return `KES ${KES_FORMATTER.format(amount)}`;
}

export function formatPriceLabel(value) {
  const amount = Number(value) || 0;
  return amount <= 0 ? 'Free' : formatKes(amount);
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return 'Date to be announced';
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return 'Date TBA';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatTime(value) {
  const date = toDate(value);
  if (!date) return 'Time TBA';
  return new Intl.DateTimeFormat('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return 'Date and time to be announced';
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function toDateTimeLocal(value) {
  const date = toDate(value);
  if (!date) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function daysUntil(value) {
  const date = toDate(value);
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const categoryObject =
    raw.category && typeof raw.category === 'object' ? raw.category : null;
  const categoryName =
    categoryObject?.name ||
    raw.category_name ||
    (typeof raw.category === 'string' ? raw.category : '') ||
    'other';
  const organizerObject =
    raw.organizer && typeof raw.organizer === 'object' ? raw.organizer : null;
  const organizerName =
    organizerObject?.username ||
    (typeof raw.organizer === 'string' ? raw.organizer : '') ||
    'LERA organizer';
  const capacity = Number(raw.capacity) || 0;
  const reserved = Number(
    raw.reserved_seats ?? raw.reservedSeats ?? raw.tickets_sold ?? 0
  ) || 0;
  const available =
    raw.available_tickets != null || raw.availableTickets != null
      ? Math.max(Number(raw.available_tickets ?? raw.availableTickets) || 0, 0)
      : Math.max(capacity - reserved, 0);
  const date = raw.date || null;
  const dateValue = toDate(date);
  const isPast =
    typeof raw.is_past === 'boolean'
      ? raw.is_past
      : typeof raw.isPast === 'boolean'
        ? raw.isPast
        : Boolean(dateValue && dateValue.getTime() < Date.now());

  return {
    id: raw.id,
    title: raw.title || 'Untitled event',
    description: raw.description || '',
    date,
    location: raw.location || 'Venue to be announced',
    price: Number(raw.price) || 0,
    capacity,
    reservedSeats: reserved,
    availableTickets: available,
    isSoldOut: raw.is_sold_out ?? raw.isSoldOut ?? available <= 0,
    isPast,
    imageUrl: raw.image_url || raw.imageUrl || raw.image || null,
    category: String(categoryName).toLowerCase(),
    categoryId: categoryObject?.id ?? raw.category_id ?? raw.categoryId ?? null,
    organizer: organizerName,
    organizerId: organizerObject?.id ?? raw.organizer_id ?? raw.organizerId ?? null,
    rating:
      raw.average_rating != null
        ? Number(raw.average_rating)
        : raw.rating != null
          ? Number(raw.rating)
          : null,
    reviewCount: Number(raw.review_count ?? raw.reviewCount) || 0,
    ticketsSold: Number(raw.tickets_sold) || reserved,
    revenue: Number(raw.revenue) || 0,
    createdAt: raw.created_at || null,
  };
}

export function getItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export function getPagination(response, fallback = {}) {
  const pagination = response?.pagination;
  if (!pagination) {
    const total = getItems(response).length;
    return {
      page: 1,
      per_page: total,
      total,
      total_pages: 1,
      has_next: false,
      has_prev: false,
      ...fallback,
    };
  }
  return { ...fallback, ...pagination };
}

export function categoryLabel(category) {
  if (!category) return 'Other';
  return String(category)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function bookingStatusLabel(status) {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Pending';
}

export function truncate(text, length = 140) {
  const value = String(text || '').trim();
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}
