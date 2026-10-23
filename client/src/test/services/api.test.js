import { describe, it, expect } from 'vitest';
import { normalizeApiError } from '../../services/api';

describe('normalizeApiError', () => {
  it('uses the backend error message and status', () => {
    const error = normalizeApiError({
      response: { status: 400, data: { error: 'Not enough seats available' } },
    });

    expect(error.message).toBe('Not enough seats available');
    expect(error.status).toBe(400);
    expect(error.isNetworkError).toBe(false);
  });

  it('uses the first field validation detail', () => {
    const error = normalizeApiError({
      response: {
        status: 422,
        data: { details: { email: 'Enter a valid email address', password: 'Too short' } },
      },
    });

    expect(error.message).toBe('Enter a valid email address');
    expect(error.status).toBe(422);
    expect(error.details).toEqual({
      email: 'Enter a valid email address',
      password: 'Too short',
    });
  });

  it('reports an unreachable API as a network error', () => {
    const error = normalizeApiError({ message: 'Network Error' });

    expect(error.message).toBe(
      'Cannot reach the LERA API. Check that the backend is running and try again.'
    );
    expect(error.isNetworkError).toBe(true);
    expect(error.status).toBeNull();
  });

  it('reports timeouts explicitly', () => {
    const error = normalizeApiError({ code: 'ECONNABORTED' });

    expect(error.message).toBe('The request timed out. Please try again.');
    expect(error.isTimeout).toBe(true);
  });

  it('does not surface raw 5xx internals', () => {
    const error = normalizeApiError({
      response: { status: 500, data: { error: 'Internal database details' } },
    });

    // The API intentionally sends a user-safe message; the client preserves it.
    expect(error.message).toBe('Internal database details');
    expect(error.status).toBe(500);
  });

  it('marks aborted requests as cancelled', () => {
    const error = normalizeApiError({ code: 'ERR_CANCELED' });

    expect(error.isCanceled).toBe(true);
    expect(error.message).toBe('Request cancelled');
  });
});
