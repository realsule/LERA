import { describe, it, expect } from 'vitest';
import {
  bookingStatusLabel,
  categoryLabel,
  formatKes,
  formatPriceLabel,
  getItems,
  getPagination,
  normalizeEvent,
} from '../../utils/format';

describe('formatKes', () => {
  it('formats whole Kenyan shillings without decimals', () => {
    expect(formatKes(1500)).toBe('KES 1,500');
    expect(formatKes('250000')).toBe('KES 250,000');
  });

  it('falls back safely for invalid amounts', () => {
    expect(formatKes('not-a-number')).toBe('KES 0');
    expect(formatKes(null)).toBe('KES 0');
  });

  it('labels zero-priced events as free', () => {
    expect(formatPriceLabel(0)).toBe('Free');
    expect(formatPriceLabel(1200)).toBe('KES 1,200');
  });
});

describe('normalizeEvent', () => {
  it('normalises API snake_case fields', () => {
    const event = normalizeEvent({
      id: 1,
      title: 'Summit',
      date: '2030-05-01T09:00:00',
      location: 'Nairobi',
      price: '2500',
      capacity: 100,
      reserved_seats: 30,
      available_tickets: 70,
      category: { id: 2, name: 'conference' },
      organizer: { id: 9, username: 'lera' },
      average_rating: 4.25,
      review_count: 4,
    });

    expect(event).toMatchObject({
      id: 1,
      title: 'Summit',
      price: 2500,
      capacity: 100,
      reservedSeats: 30,
      availableTickets: 70,
      category: 'conference',
      categoryId: 2,
      organizer: 'lera',
      organizerId: 9,
      rating: 4.25,
      reviewCount: 4,
      isSoldOut: false,
      isPast: false,
    });
  });

  it('derives availability and missing labels without inventing data', () => {
    const event = normalizeEvent({ id: 2, capacity: 50, reserved_seats: 50 });

    expect(event.availableTickets).toBe(0);
    expect(event.isSoldOut).toBe(true);
    expect(event.location).toBe('Venue to be announced');
    expect(event.category).toBe('other');
    expect(event.price).toBe(0);
  });

  it('returns null for empty input', () => {
    expect(normalizeEvent(null)).toBeNull();
    expect(normalizeEvent('not an object')).toBeNull();
  });
});

describe('pagination helpers', () => {
  it('reads items from both legacy arrays and paginated responses', () => {
    expect(getItems([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(getItems({ items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(getItems({ unexpected: true })).toEqual([]);
  });

  it('keeps server pagination metadata', () => {
    const pagination = {
      page: 2,
      per_page: 12,
      total: 30,
      total_pages: 3,
      has_next: true,
      has_prev: true,
    };
    expect(getPagination({ items: [], pagination })).toEqual(pagination);
  });

  it('falls back to a single page for legacy arrays', () => {
    expect(getPagination([{ id: 1 }, { id: 2 }])).toMatchObject({
      page: 1,
      per_page: 2,
      total: 2,
      total_pages: 1,
    });
  });
});

describe('label helpers', () => {
  it('humanises categories and booking statuses', () => {
    expect(categoryLabel('music')).toBe('Music');
    expect(categoryLabel('food-and-drink')).toBe('Food And Drink');
    expect(bookingStatusLabel('confirmed')).toBe('Confirmed');
    expect(bookingStatusLabel('cancelled')).toBe('Cancelled');
    expect(bookingStatusLabel('pending')).toBe('Pending');
  });
});
