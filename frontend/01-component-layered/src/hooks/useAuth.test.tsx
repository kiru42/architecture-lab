import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '../services/authService';
import { useAuth } from './useAuth';
import type { User } from '../types';

vi.mock('../services/authService', () => ({
  authService: {
    signup: vi.fn(),
    signin: vi.fn(),
    getProfile: vi.fn(),
  },
}));

const mockedAuth = vi.mocked(authService);

const user: User = {
  id: '1',
  email: 'kiru@example.com',
  name: 'Kiru',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('useAuth', () => {
  it('stops loading with no user when there is no stored token', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(mockedAuth.getProfile).not.toHaveBeenCalled();
  });

  it('restores the session from the stored token', async () => {
    localStorage.setItem('token', 'jwt-1');
    mockedAuth.getProfile.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.user).toEqual(user));
    expect(mockedAuth.getProfile).toHaveBeenCalledTimes(1);
  });

  it('drops an invalid token and reports the error', async () => {
    localStorage.setItem('token', 'stale');
    mockedAuth.getProfile.mockRejectedValue(new Error('Failed to fetch profile'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.error).toBe('Failed to fetch profile');
  });

  it('signin stores the token and exposes the user', async () => {
    mockedAuth.signin.mockResolvedValue({ user, token: 'jwt-2' });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signin('kiru@example.com', 's3cret');
    });

    expect(localStorage.getItem('token')).toBe('jwt-2');
    expect(result.current.user).toEqual(user);
  });

  it('signout clears both the token and the user', async () => {
    localStorage.setItem('token', 'jwt-3');
    mockedAuth.getProfile.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.user).toEqual(user));

    act(() => {
      result.current.signout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
