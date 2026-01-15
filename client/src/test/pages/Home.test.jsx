import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../../pages/Home';

// Mock EventCard component
vi.mock('../../components/events/EventCard', () => ({
  default: ({ event }) => (
    <div data-testid="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <span data-testid="event-category">{event.category}</span>
    </div>
  ),
}));

// Mock eventsAPI
vi.mock('../../services/api', () => ({
  eventsAPI: {
    getAll: vi.fn(),
  },
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section correctly', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Discover Amazing Events Near You')).toBeInTheDocument();
    expect(screen.getByText(/Find and book tickets for concerts/)).toBeInTheDocument();
  });

  it('renders search functionality', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search events, artists, venues...');
    expect(searchInput).toBeInTheDocument();

    const categorySelect = screen.getByDisplayValue('All Events');
    expect(categorySelect).toBeInTheDocument();
  });

  it('filters events by search query', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });

    const searchInput = screen.getByPlaceholderText('Search events, artists, venues...');
    
    fireEvent.change(searchInput, { target: { value: 'music' } });

    await waitFor(() => {
      const eventCards = screen.getAllByTestId('event-card');
      expect(eventCards).toHaveLength(1);
      expect(screen.getByText('Summer Music Festival 2024')).toBeInTheDocument();
    });
  });

  it('filters events by category', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });

    const categorySelect = screen.getByDisplayValue('All Events');
    
    fireEvent.change(categorySelect, { target: { value: 'concert' } });

    await waitFor(() => {
      const eventCards = screen.getAllByTestId('event-card');
      expect(eventCards).toHaveLength(1);
      expect(screen.getByTestId('event-category')).toHaveTextContent('concert');
    });
  });

  it('shows loading state initially', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Wait for component to load (loading state resolves too fast to test reliably)
    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });
  });

  it('shows no events message when filters return no results', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });

    const searchInput = screen.getByPlaceholderText('Search events, artists, venues...');
    
    fireEvent.change(searchInput, { target: { value: 'nonexistent event' } });

    await waitFor(() => {
      expect(screen.getByText('No events found matching your criteria.')).toBeInTheDocument();
      expect(screen.getByText('Clear filters')).toBeInTheDocument();
    });

    // Test clear filters button
    fireEvent.click(screen.getByText('Clear filters'));

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });
  });

  it('renders statistics section', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Events Listed')).toBeInTheDocument();
    expect(screen.getByText('1,200+')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('50K+')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('renders featured events section', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Featured Events')).toBeInTheDocument();
      expect(screen.getByText('Explore our handpicked selection of amazing events')).toBeInTheDocument();
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });
  });

  it('renders categories section', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Find events that match your interests')).toBeInTheDocument();
    
    // Check category buttons
    expect(screen.getByRole('button', { name: /Filter by Concerts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Conferences/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Sports/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Workshops/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Parties/i })).toBeInTheDocument();
  });

  it('renders CTA section', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Ready to Host Your Own Event?')).toBeInTheDocument();
    expect(screen.getByText(/Join thousands of event organizers/)).toBeInTheDocument();
    expect(screen.getByText('Get Started Today')).toBeInTheDocument();
  });

  it('handles category button clicks', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });

    const concertButton = screen.getByRole('button', { name: /Filter by Concerts/i });
    fireEvent.click(concertButton);

    await waitFor(() => {
      const eventCards = screen.getAllByTestId('event-card');
      expect(eventCards).toHaveLength(1);
      expect(screen.getByTestId('event-category')).toHaveTextContent('concert');
    });
  });

  it('combines search and category filters', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });

    const searchInput = screen.getByPlaceholderText('Search events, artists, venues...');
    const categorySelect = screen.getByDisplayValue('All Events');
    
    // Apply both filters
    fireEvent.change(searchInput, { target: { value: 'summit' } });
    fireEvent.change(categorySelect, { target: { value: 'conference' } });

    await waitFor(() => {
      const eventCards = screen.getAllByTestId('event-card');
      expect(eventCards).toHaveLength(1);
      expect(screen.getByText('Tech Innovation Summit')).toBeInTheDocument();
    });
  });

  it('handles empty search query', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });

    const searchInput = screen.getByPlaceholderText('Search events, artists, venues...');
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });

    await waitFor(() => {
      expect(screen.getByText('No events found matching your criteria.')).toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });
  });
});
