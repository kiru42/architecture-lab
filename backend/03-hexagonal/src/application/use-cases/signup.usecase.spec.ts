import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupUseCase } from './signup.usecase';
import { IUserRepository } from '../../domain/ports/secondary/user.repository.interface';
import { User } from '../../domain/model/user.entity';

const user = (overrides: Partial<{ email: string; password: string; name: string }> = {}): User =>
  new User({
    id: 'u1',
    email: overrides.email ?? 'kiru@example.com',
    password: overrides.password ?? 'hashed',
    name: overrides.name ?? 'Kiru',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const makeUserRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
});

const makeJwtService = () => ({ sign: jest.fn().mockReturnValue('signed.jwt') });

const useCaseWith = (
  users: ReturnType<typeof makeUserRepository>,
  jwt: ReturnType<typeof makeJwtService>,
) => new SignupUseCase(users as unknown as IUserRepository, jwt as unknown as JwtService);

describe('SignupUseCase', () => {
  it('refuses an email that is already taken', async () => {
    const users = makeUserRepository();
    users.findByEmail.mockResolvedValue(user());

    await expect(
      useCaseWith(users, makeJwtService()).execute('kiru@example.com', 'plain', 'Kiru'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(users.create).not.toHaveBeenCalled();
  });

  it('hashes the password before handing it to the repository', async () => {
    const users = makeUserRepository();
    users.findByEmail.mockResolvedValue(null);
    users.create.mockImplementation((email: string, password: string, name: string) =>
      Promise.resolve(user({ email, password, name })),
    );

    await useCaseWith(users, makeJwtService()).execute('kiru@example.com', 'plain-secret', 'Kiru');

    const stored = users.create.mock.calls[0][1];
    expect(stored).not.toBe('plain-secret');
    await expect(bcrypt.compare('plain-secret', stored)).resolves.toBe(true);
  });

  it('returns the user and a signed token', async () => {
    const users = makeUserRepository();
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(user());

    const result = await useCaseWith(users, makeJwtService()).execute(
      'kiru@example.com',
      'plain-secret',
      'Kiru',
    );

    expect(result.token).toBe('signed.jwt');
    expect(result.user.email).toBe('kiru@example.com');
  });
});
