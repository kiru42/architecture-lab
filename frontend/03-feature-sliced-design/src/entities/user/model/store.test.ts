import { beforeEach, describe, expect, it } from 'vitest';
import { useUserStore } from './store';
import type { User } from '../../../shared/types';

const user: User = {
  id: '1',
  email: 'kiru@example.com',
  name: 'Kiru',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
  useUserStore.setState({ user: null, isAuthenticated: false, isLoading: true });
});

describe('useUserStore', () => {
  it('setUser marks the session as authenticated', () => {
    useUserStore.getState().setUser(user);

    expect(useUserStore.getState().user).toEqual(user);
    expect(useUserStore.getState().isAuthenticated).toBe(true);
  });

  it('setUser(null) clears the authenticated flag', () => {
    useUserStore.getState().setUser(user);

    useUserStore.getState().setUser(null);

    expect(useUserStore.getState().user).toBeNull();
    expect(useUserStore.getState().isAuthenticated).toBe(false);
  });

  it('setLoading toggles the loading flag', () => {
    useUserStore.getState().setLoading(false);

    expect(useUserStore.getState().isLoading).toBe(false);
  });

  it('logout drops the stored token and resets the session', () => {
    localStorage.setItem('token', 'jwt-1');
    useUserStore.getState().setUser(user);

    useUserStore.getState().logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(useUserStore.getState().user).toBeNull();
    expect(useUserStore.getState().isAuthenticated).toBe(false);
  });
});
