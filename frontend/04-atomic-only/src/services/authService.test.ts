import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './authService';

const user = {
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

describe('authService', () => {
  it('signup stores the token and returns the payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ user, token: 'jwt-1' }));

    const result = await authService.signup('kiru@example.com', 'Kiru', 's3cret');

    expect(result.token).toBe('jwt-1');
    expect(localStorage.getItem('token')).toBe('jwt-1');
  });

  it('signup fails loudly when the API rejects the credentials', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'nope' }, false, 400));

    await expect(authService.signup('kiru@example.com', 'Kiru', 's3cret')).rejects.toThrow(
      'Signup failed',
    );
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('signin fails loudly when the API rejects the credentials', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'nope' }, false, 401));

    await expect(authService.signin('kiru@example.com', 's3cret')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('getProfile sends the stored bearer token', async () => {
    localStorage.setItem('token', 'jwt-2');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(user));

    await expect(authService.getProfile()).resolves.toEqual(user);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/me');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-2');
  });

  it('signout drops the stored token', () => {
    localStorage.setItem('token', 'jwt-3');

    authService.signout();

    expect(localStorage.getItem('token')).toBeNull();
  });
});
