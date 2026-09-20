import { describe, expect, it, vi } from 'vitest';
import {
  GetProfileUseCase,
  IsAuthenticatedUseCase,
  SignInUseCase,
  SignOutUseCase,
  SignUpUseCase,
} from './auth.use-cases';
import type { IAuthRepository } from '@domain/ports';
import type { AuthResponse, User } from '@domain/entities';

const user: User = {
  id: '1',
  email: 'kiru@example.com',
  name: 'Kiru',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const authResponse: AuthResponse = { user, token: 'jwt-1' };

function createRepository() {
  return {
    signUp: vi.fn().mockResolvedValue(authResponse),
    signIn: vi.fn().mockResolvedValue(authResponse),
    getProfile: vi.fn().mockResolvedValue(user),
    signOut: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
    getToken: vi.fn().mockReturnValue('jwt-1'),
  };
}

const asPort = (repository: ReturnType<typeof createRepository>) =>
  repository as unknown as IAuthRepository;

describe('auth use cases', () => {
  it('SignUpUseCase forwards the signup to the repository', async () => {
    const repository = createRepository();

    const result = await new SignUpUseCase(asPort(repository)).execute(
      'kiru@example.com',
      'Kiru',
      's3cret',
    );

    expect(result).toEqual(authResponse);
    expect(repository.signUp).toHaveBeenCalledWith('kiru@example.com', 'Kiru', 's3cret');
  });

  it('SignInUseCase forwards the credentials to the repository', async () => {
    const repository = createRepository();

    await new SignInUseCase(asPort(repository)).execute('kiru@example.com', 's3cret');

    expect(repository.signIn).toHaveBeenCalledWith('kiru@example.com', 's3cret');
  });

  it('GetProfileUseCase passes the token along', async () => {
    const repository = createRepository();

    await expect(new GetProfileUseCase(asPort(repository)).execute('jwt-9')).resolves.toEqual(user);

    expect(repository.getProfile).toHaveBeenCalledWith('jwt-9');
  });

  it('SignOutUseCase delegates the cleanup', () => {
    const repository = createRepository();

    new SignOutUseCase(asPort(repository)).execute();

    expect(repository.signOut).toHaveBeenCalledTimes(1);
  });

  it('IsAuthenticatedUseCase reflects the repository state', () => {
    const repository = createRepository();

    expect(new IsAuthenticatedUseCase(asPort(repository)).execute()).toBe(true);
    expect(repository.isAuthenticated).toHaveBeenCalledTimes(1);
  });
});
