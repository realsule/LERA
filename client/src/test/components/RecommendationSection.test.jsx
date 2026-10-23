import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RecommendationSection from '../../components/events/RecommendationSection';

const mocks = vi.hoisted(() => ({
  getRecommendations: vi.fn(),
  getCategories: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../../services/api', () => ({
  recommendationsAPI: { get: mocks.getRecommendations },
  categoriesAPI: { getAll: mocks.getCategories },
}));

vi.mock('../../components/events/EventCard', () => ({
  default: ({ event, reason }) => (
    <div data-testid="recommendation-card">
      <h3>{event.title}</h3>
      <p>{reason}</p>
    </div>
  ),
}));

const categories = [
  { id: 1, name: 'music' },
  { id: 2, name: 'conference' },
];

const renderSection = () =>
  render(<RecommendationSection categories={categories} limit={2} />);

describe('RecommendationSection', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.getRecommendations.mockReset();
    mocks.getCategories.mockReset();
  });

  it('renders real recommended events with their server reason', async () => {
    mocks.getRecommendations.mockResolvedValue({
      strategy: 'content_based',
      personalized: false,
      interests_used: ['music'],
      items: [
        {
          event_id: 42,
          reason: 'Matches your interest in music',
          event: { id: 42, title: 'Nairobi Jazz Night' },
        },
      ],
    });

    renderSection();

    expect(screen.getByText('Smart discovery')).toBeInTheDocument();
    expect(await screen.findByText('Nairobi Jazz Night')).toBeInTheDocument();
    expect(screen.getByText('Matches your interest in music')).toBeInTheDocument();
    expect(screen.getByText('Data-driven content ranking')).toBeInTheDocument();
    expect(mocks.getRecommendations).toHaveBeenCalledWith(
      { limit: 2 },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('labels AI reranking honestly when the server reports it', async () => {
    mocks.getRecommendations.mockResolvedValue({
      strategy: 'ai_rerank',
      personalized: true,
      items: [],
      message: 'No matching events.',
    });

    renderSection();

    expect(
      await screen.findByText('AI-assisted reranking of real events')
    ).toBeInTheDocument();
    expect(screen.getByText('Tuned to your bookings')).toBeInTheDocument();
    expect(screen.getByText('No matching available events yet')).toBeInTheDocument();
  });

  it('shows an error and retries without inventing events', async () => {
    mocks.getRecommendations
      .mockRejectedValueOnce(new Error('Recommendations service unavailable'))
      .mockResolvedValueOnce({ strategy: 'content_based', items: [] });

    renderSection();

    expect(
      await screen.findByText('Recommendations service unavailable')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(mocks.getRecommendations).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Recommendations service unavailable')).not.toBeInTheDocument();
  });

  it('sends selected interests and budget when preferences are updated', async () => {
    mocks.getRecommendations.mockResolvedValue({ strategy: 'content_based', items: [] });

    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Music' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2500' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Nairobi'), {
      target: { value: 'Nairobi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update recommendations' }));

    await waitFor(() =>
      expect(mocks.getRecommendations).toHaveBeenLastCalledWith(
        {
          interests: 'music',
          budget: 2500,
          location: 'Nairobi',
          limit: 2,
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    );
  });
});
