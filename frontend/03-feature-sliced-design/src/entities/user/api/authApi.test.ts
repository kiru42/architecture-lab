import { beforeEach, describe, expect, it, vi } from 'vitest';

const { postMock, getMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  getMock: vi.fn(),
}));

vi.mock('../../../shared/api/client', () => ({
  apiClient: { post: postMock, get: getMock, patch: vi.fn(), delete: vi.fn() },
}));

import { authApi } from './index';
import type { User } from '../../../shared/types';

const user: User = {
  id: '1',
  email: 'kiru@example.com',
  name: 'Kiru',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  postMock.mockReset();
  getMock.mockReset();
  localStorage.clear();
});

describe('authApi', () => {
  it('signup POSTs to /auth/signup and stores the token', async () => {
    postMock.mockResolvedValue({ user, token: 'jwt-1' });

    const result = await authApi.signup({
      email: 'kiru@example.com',
      name: 'Kiru',
      password: 's3cret',
    });

    expect(result.token).toBe('jwt-1');
    expect(postMock).toHaveBeenCalledWith('/auth/signup', {
      email: 'kiru@example.com',
      name: 'Kiru',
      password: 's3cret',
    });
    expect(localStorage.getItem('token')).toBe('jwt-1');
  });

  it('signin POSTs to /auth/signin and stores the token', async () => {
    postMock.mockResolvedValue({ user, token: 'jwt-2' });

    await authApi.signin({ email: 'kiru@example.com', password: 's3cret' });

    expect(postMock).toHaveBeenCalledWith('/auth/signin', {
      email: 'kiru@example.com',
      password: 's3cret',
    });
    expect(localStorage.getItem('token')).toBe('jwt-2');
  });

  it('getProfile returns the user as returned by GET /auth/me', async () => {
    getMock.mockResolvedValue(user);

    await expect(authApi.getProfile()).resolves.toEqual(user);
    expect(getMock).toHaveBeenCalledWith('/auth/me');
  });
});
