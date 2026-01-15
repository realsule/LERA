import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import EventCard from '../../components/events/EventCard';

// Mock data for testing
const mockEvent = {
  id: '1',
  title: 'Summer Music Festival 2024',
  description: 'Experience the best of live music with top artists from around the world.',
  category: 'concert',
  date: '2024-07-15',
  time: '18:00',
  venue: 'Central Park Arena',
  ticketTypes: [
    { name: 'General Admission', price: 75, quantity: 500 },
    { name: 'VIP Pass', price: 150, quantity: 100 },
  ],
  image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop',
  organizer: {
    firstName: 'John',
    lastName: 'Doe'
  },
  totalTickets: 600,
  availableTickets: 450,
  ticketsSold: 150,
  revenue: 15000,
  rating: 4.5,
  reviews: 128,
  tags: ['music', 'festival', 'outdoor']
};

// Test wrapper with Router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('EventCard Component', () => {
  it('renders event information correctly', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    // Check basic event info
    expect(screen.getByText('Summer Music Festival 2024')).toBeInTheDocument();
    expect(screen.getByText('Experience the best of live music with top artists from around the world.')).toBeInTheDocument();
    expect(screen.getByText('Central Park Arena')).toBeInTheDocument();
    expect(screen.getByText('Concert')).toBeInTheDocument();
  });

  it('displays correct date and time formatting', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    // Check date formatting (should show abbreviated date)
    expect(screen.getByText(/Jul.*15.*6:00 PM/)).toBeInTheDocument();
  });

  it('shows correct ticket availability status', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('450/600 tickets')).toBeInTheDocument();
    expect(screen.getByText('From $75')).toBeInTheDocument();
  });

  it('displays sold out status correctly', () => {
    const soldOutEvent = { ...mockEvent, availableTickets: 0 };
    
    render(
      <TestWrapper>
        <EventCard event={soldOutEvent} />
      </TestWrapper>
    );

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('displays limited availability status', () => {
    const limitedEvent = { ...mockEvent, availableTickets: 50, totalTickets: 600 };
    
    render(
      <TestWrapper>
        <EventCard event={limitedEvent} />
      </TestWrapper>
    );

    expect(screen.getByText('Limited')).toBeInTheDocument();
  });

  it('shows organizer information', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    expect(screen.getAllByText('Organizer')).toHaveLength(2);
  });

  it('displays rating and reviews', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    expect(screen.getAllByText(/4\.5/)).toHaveLength(2);
    expect(screen.getAllByText(/128 reviews/)).toHaveLength(2);
  });

  it('shows event tags', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    expect(screen.getByText('music')).toBeInTheDocument();
    expect(screen.getByText('festival')).toBeInTheDocument();
    expect(screen.getByText('outdoor')).toBeInTheDocument();
  });

  it('renders action buttons when showActions is true', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} showActions={true} />
      </TestWrapper>
    );

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Add to favorites/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Share event/i })).toHaveLength(2);
  });

  it('hides action buttons when showActions is false', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} showActions={false} />
      </TestWrapper>
    );

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /Add to favorites/i })).toHaveLength(0);
    expect(screen.queryAllByRole('button', { name: /Share event/i })).toHaveLength(0);
  });

  it('has correct link to event detail page', () => {
    render(
      <TestWrapper>
        <EventCard event={mockEvent} />
      </TestWrapper>
    );

    const viewDetailsLink = screen.getByText('View Details');
    expect(viewDetailsLink.closest('a')).toHaveAttribute('href', '/events/1');
  });

  it('handles missing data gracefully', () => {
    const incompleteEvent = {
      id: '2',
      title: 'Incomplete Event',
      description: 'Missing some data',
      category: 'workshop',
      date: '2024-08-20',
      time: '14:00',
      venue: 'Test Venue',
      totalTickets: 100,
      availableTickets: 80,
    };

    render(
      <TestWrapper>
        <EventCard event={incompleteEvent} />
      </TestWrapper>
    );

    expect(screen.getByText('Incomplete Event')).toBeInTheDocument();
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('From $0')).toBeInTheDocument(); // Default price when no ticket types
  });

  it('calculates lowest price correctly', () => {
    const multiPriceEvent = {
      ...mockEvent,
      ticketTypes: [
        { name: 'Early Bird', price: 25, quantity: 100 },
        { name: 'Regular', price: 50, quantity: 200 },
        { name: 'VIP', price: 100, quantity: 50 },
      ],
    };

    render(
      <TestWrapper>
        <EventCard event={multiPriceEvent} />
      </TestWrapper>
    );

    expect(screen.getByText('From $25')).toBeInTheDocument();
  });
});
