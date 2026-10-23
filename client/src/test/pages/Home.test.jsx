import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../../pages/Home';

const mocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  getCategories: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, hasAnyRole: () => false }),
}));

vi.mock('../../services/api', () => ({
  eventsAPI: { getAll: mocks.getAll },
  categoriesAPI: { getAll: mocks.getCategories },
}));

vi.mock('../../components/events/RecommendationSection', () => ({
  default: () => <div data-testid="recommendations" />,
}));

const event = {
  id: 42,
  title: 'Nairobi Jazz Night',
  description: 'Live jazz in Nairobi.',
  date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Alliance Française, Nairobi',
  price: 1500,
  capacity: 200,
  available_tickets: 80,
  category: { id: 3, name: 'music' },
  organizer: { id: 7, username: 'organizer' },
};

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe('Home page', () => {
  beforeEach(() => {
    mocks.getAll.mockReset();
    mocks.getCategories.mockReset();
    mocks.getAll.mockResolvedValue({
      items: [event],
      pagination: { page: 1, per_page: 6, total: 1, total_pages: 1 },
    });
    mocks.getCategories.mockResolvedValue([{ id: 3, name: 'music', event_count: 1 }]);
  });

  it('renders the marketplace hero and requests upcoming available events', async () => {
    renderHome();

    expect(screen.getByText('Find your next unforgettable event.')).toBeInTheDocument();

    await waitFor(() =>
      expect(mocks.getAll).toHaveBeenCalledWith(
        {
          page: 1,
          per_page: 6,
          upcoming: 'true',
          available: 'true',
          sort: 'date_asc',
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    );
  });

  it('renders API events and the real total count', async () => {
    renderHome();

    expect(await screen.findByText('Nairobi Jazz Night')).toBeInTheDocument();
    expect(screen.getByText('Featured events')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('KES 1,500').length).toBeGreaterThan(0);
  });

  it('shows an actionable error instead of placeholder events', async () => {
    mocks.getAll.mockRejectedValue(new Error('Cannot reach the LERA API'));

    renderHome();

    expect(await screen.findByText('Events could not be loaded')).toBeInTheDocument();
    expect(screen.getByText('Cannot reach the LERA API')).toBeInTheDocument();
    expect(screen.queryByText('Nairobi Jazz Night')).not.toBeInTheDocument();
  });
});
