import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TicketSelector from '../../components/events/TicketSelector';

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: true, user: { id: 5, username: 'attendee1' } },
  createBooking: vi.fn(),
  pay: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('../../services/api', () => ({
  bookingsAPI: { create: mocks.createBooking },
  paymentsAPI: { pay: mocks.pay },
}));

const event = {
  id: 42,
  title: 'Nairobi Jazz Night',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Alliance Française, Nairobi',
  price: 1500,
  capacity: 100,
  available_tickets: 40,
  category: { id: 3, name: 'music' },
  organizer: { id: 7, username: 'organizer' },
};

const renderSelector = () =>
  render(
    <MemoryRouter>
      <TicketSelector event={event} />
    </MemoryRouter>
  );

describe('TicketSelector', () => {
  beforeEach(() => {
    mocks.auth = { isAuthenticated: true, user: { id: 5, username: 'attendee1' } };
    mocks.createBooking.mockReset();
    mocks.pay.mockReset();
  });

  it('asks signed-out visitors to sign in instead of faking a booking', () => {
    mocks.auth = { isAuthenticated: false, user: null };
    renderSelector();

    expect(screen.getByText('Sign in to reserve seats for this event.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in to book' })).toHaveAttribute(
      'href',
      '/login'
    );
    expect(screen.queryByRole('button', { name: 'Reserve seats' })).not.toBeInTheDocument();
  });

  it('submits the selected quantity to the real booking endpoint', async () => {
    mocks.createBooking.mockResolvedValue({
      id: 10,
      reference: 'LERA-000010',
      tickets_count: 2,
      total_price: 3000,
      status: 'pending',
    });

    renderSelector();

    fireEvent.click(screen.getByRole('button', { name: 'Add one ticket' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Reserve seats' }));

    await waitFor(() =>
      expect(mocks.createBooking).toHaveBeenCalledWith({
        event_id: 42,
        tickets_count: 2,
        special_requests: null,
      })
    );

    expect(await screen.findByText('Seats reserved')).toBeInTheDocument();
    expect(screen.getByText('LERA-000010')).toBeInTheDocument();
    expect(screen.getByText('KES 3,000')).toBeInTheDocument();
    expect(mocks.pay).not.toHaveBeenCalled();
  });

  it('confirms the booking through the server and updates its status', async () => {
    const pending = {
      id: 10,
      reference: 'LERA-000010',
      tickets_count: 1,
      total_price: 1500,
      status: 'pending',
    };
    mocks.createBooking.mockResolvedValue(pending);
    mocks.pay.mockResolvedValue({ booking: { ...pending, status: 'confirmed' } });

    renderSelector();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Reserve seats' }));

    await screen.findByText('Seats reserved');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));

    await waitFor(() => expect(mocks.pay).toHaveBeenCalledWith(10));
    expect(await screen.findByText('Booking confirmed')).toBeInTheDocument();
    expect(screen.getByText(/no card is charged/)).toBeInTheDocument();
  });

  it('shows the server error when seats cannot be reserved', async () => {
    mocks.createBooking.mockRejectedValue(new Error('Not enough seats available'));

    renderSelector();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Reserve seats' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Not enough seats available'
    );
  });

  it('closes booking for sold-out events', () => {
    render(
      <MemoryRouter>
        <TicketSelector event={{ ...event, available_tickets: 0 }} />
      </MemoryRouter>
    );

    expect(screen.getByText('This event is sold out.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reserve seats' })).toBeDisabled();
  });
});
