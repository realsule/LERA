import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import EventCard from '../../components/events/EventCard';

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const baseEvent = {
  id: 42,
  title: 'Nairobi Jazz Night',
  description: 'An evening of live jazz from Kenyan artists.',
  date: futureDate,
  location: 'Alliance Française, Nairobi',
  price: 1500,
  capacity: 200,
  available_tickets: 80,
  category: { id: 3, name: 'music' },
  organizer: { id: 7, username: 'organizer' },
  average_rating: 4.5,
  review_count: 12,
};

const renderCard = (event = baseEvent) =>
  render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>
  );

describe('EventCard', () => {
  it('renders real event details and a KES price', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Nairobi Jazz Night' })).toHaveAttribute(
      'href',
      '/events/42'
    );
    expect(screen.getByText('Alliance Française, Nairobi')).toBeInTheDocument();
    expect(screen.getByText('KES 1,500')).toBeInTheDocument();
    expect(screen.getAllByText('Music').length).toBeGreaterThan(0);
    expect(screen.getByText('80 / 200 available')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('shows sold out state without offering a price as available', () => {
    renderCard({ ...baseEvent, available_tickets: 0 });

    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });

  it('shows low availability when 15% or fewer seats remain', () => {
    renderCard({ ...baseEvent, capacity: 100, available_tickets: 10 });

    expect(screen.getByText('Few seats left')).toBeInTheDocument();
  });

  it('marks past events as ended', () => {
    renderCard({ ...baseEvent, date: '2020-01-01T18:00:00.000Z' });

    expect(screen.getByText('Event ended')).toBeInTheDocument();
  });

  it('renders a recommendation reason only when supplied', () => {
    const { rerender } = render(
      <MemoryRouter>
        <EventCard event={baseEvent} reason="Because you like music in Nairobi" />
      </MemoryRouter>
    );
    expect(screen.getByText('Because you like music in Nairobi')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>
    );
    expect(screen.queryByText('Because you like music in Nairobi')).not.toBeInTheDocument();
  });

  it('returns nothing for missing event data', () => {
    const { container } = render(
      <MemoryRouter>
        <EventCard event={null} />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
