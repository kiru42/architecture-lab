import { beforeEach, describe, expect, it, vi } from 'vitest';

const { postMock, getMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  getMock: vi.fn(),
}));

vi.mock('../api/api-client', () => ({
  apiClient: { post: postMock, get: getMock, patch: vi.fn(), delete: vi.fn() },
}));

import { HttpAuthRepository } from './HttpAuthRepository';
import type { AuthResponse, User } from '@domain/entities';

const TOKEN_KEY = 'auth_token';

const user: User = {
  id: 1,
  email: 'kiru@example.com',
  name: 'Kiru',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const authResponse: AuthResponse = { user, token: 'jwt-1' };

describe('HttpAuthRepository', () => {
  let repository: HttpAuthRepository;

  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
    localStorage.clear();
    repository = new HttpAuthRepository();
  });

  it('signUp POSTs to /auth/signup and persists the token', async () => {
    postMock.mockResolvedValue(authResponse);

    const result = await repository.signUp('kiru@example.com', 'Kiru', 's3cret');

    expect(result).toEqual(authResponse);
    expect(postMock).toHaveBeenCalledWith('/auth/signup', {
      email: 'kiru@example.com',
      name: 'Kiru',
      password: 's3cret',
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1');
  });

  it('signIn POSTs to /auth/signin and persists the token', async () => {
    postMock.mockResolvedValue(authResponse);

    await repository.signIn('kiru@example.com', 's3cret');

    expect(postMock).toHaveBeenCalledWith('/auth/signin', {
      email: 'kiru@example.com',
      password: 's3cret',
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1');
  });

  it('getProfile GETs /auth/me with the token handed to it', async () => {
    getMock.mockResolvedValue(user);

    await expect(repository.getProfile('jwt-9')).resolves.toEqual(user);
    expect(getMock).toHaveBeenCalledWith('/auth/me', 'jwt-9');
  });

  it('reports authentication from the stored token', () => {
    expect(repository.isAuthenticated()).toBe(false);

    localStorage.setItem(TOKEN_KEY, 'jwt-1');

    expect(repository.isAuthenticated()).toBe(true);
    expect(repository.getToken()).toBe('jwt-1');
  });

  it('signOut drops the stored token', () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1');

    repository.signOut();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(repository.isAuthenticated()).toBe(false);
  });
});
