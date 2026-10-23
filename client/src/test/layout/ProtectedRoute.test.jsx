import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../../layout/ProtectedRoute';

const mocks = vi.hoisted(() => ({
  auth: {
    loading: false,
    isAuthenticated: false,
    hasAnyRole: () => false,
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mocks.auth,
}));

const renderRoute = (roles = []) =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/unauthorized" element={<p>Unauthorized page</p>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={roles}>
              <p>Private dashboard</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mocks.auth = {
      loading: false,
      isAuthenticated: false,
      hasAnyRole: () => false,
    };
  });

  it('shows a session check while auth is loading', () => {
    mocks.auth = { ...mocks.auth, loading: true };
    renderRoute();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Private dashboard')).not.toBeInTheDocument();
  });

  it('redirects signed-out visitors to login', () => {
    renderRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects signed-in users without the required role', () => {
    mocks.auth = {
      loading: false,
      isAuthenticated: true,
      hasAnyRole: () => false,
    };
    renderRoute(['organizer']);

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
  });

  it('renders children for authorised users', () => {
    mocks.auth = {
      loading: false,
      isAuthenticated: true,
      hasAnyRole: (roles) => roles.includes('organizer'),
    };
    renderRoute(['organizer']);

    expect(screen.getByText('Private dashboard')).toBeInTheDocument();
  });
});
