import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './authService';
import type { User } from '../types';

const user: User = {
  id: '1',
  email: 'kiru@example.com',
  name: 'Kiru',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('authService.signup', () => {
  it('POSTs to /api/auth/signup and returns the auth payload', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ user, token: 'jwt-1' }));

    const result = await authService.signup('kiru@example.com', 'Kiru', 's3cret');

    expect(result).toEqual({ user, token: 'jwt-1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/signup');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'kiru@example.com',
      name: 'Kiru',
      password: 's3cret',
    });
  });

  it('surfaces the server message when the signup is rejected', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ message: 'Email already taken' }, false, 400),
    );

    await expect(authService.signup('kiru@example.com', 'Kiru', 's3cret')).rejects.toThrow(
      'Email already taken',
    );
  });
});

describe('authService.signin', () => {
  it('POSTs to /api/auth/signin', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ user, token: 'jwt-2' }));

    const result = await authService.signin('kiru@example.com', 's3cret');

    expect(result.token).toBe('jwt-2');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/signin');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'kiru@example.com',
      password: 's3cret',
    });
  });
});

describe('authService.getProfile', () => {
  it('GETs /api/auth/me with the stored bearer token', async () => {
    localStorage.setItem('token', 'jwt-3');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(user));

    const result = await authService.getProfile();

    expect(result).toEqual(user);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/me');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-3');
  });

  it('fails when the API rejects the token', async () => {
    localStorage.setItem('token', 'stale');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, false, 401));

    await expect(authService.getProfile()).rejects.toThrow('Failed to fetch profile');
  });
});
