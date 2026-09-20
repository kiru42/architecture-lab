import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';

const user = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  email: 'kiru@example.com',
  password: 'hashed',
  name: 'Kiru',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const makeUsersService = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
});

const makeJwtService = () => ({ sign: jest.fn().mockReturnValue('signed.jwt') });

const serviceWith = (
  users: ReturnType<typeof makeUsersService>,
  jwt: ReturnType<typeof makeJwtService>,
) => new AuthService(users as unknown as UsersService, jwt as unknown as JwtService);

describe('AuthService', () => {
  describe('signup', () => {
    it('refuses an email that is already in use', async () => {
      const users = makeUsersService();
      users.findByEmail.mockResolvedValue(user());

      await expect(
        serviceWith(users, makeJwtService()).signup('kiru@example.com', 'plain', 'Kiru'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });

    it('hashes the password and never returns it', async () => {
      const users = makeUsersService();
      users.findByEmail.mockResolvedValue(null);
      users.create.mockImplementation((data: { email: string; password: string; name: string }) =>
        Promise.resolve(user({ email: data.email, password: data.password, name: data.name })),
      );

      const result = await serviceWith(users, makeJwtService()).signup(
        'kiru@example.com',
        'plain-secret',
        'Kiru',
      );

      const stored = users.create.mock.calls[0][0].password;
      expect(stored).not.toBe('plain-secret');
      await expect(bcrypt.compare('plain-secret', stored)).resolves.toBe(true);
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('signed.jwt');
    });
  });

  describe('signin', () => {
    it('refuses an unknown email', async () => {
      const users = makeUsersService();
      users.findByEmail.mockResolvedValue(null);

      await expect(
        serviceWith(users, makeJwtService()).signin('nobody@example.com', 'plain'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('refuses a wrong password', async () => {
      const users = makeUsersService();
      users.findByEmail.mockResolvedValue(user({ password: await bcrypt.hash('right', 4) }));

      await expect(
        serviceWith(users, makeJwtService()).signin('kiru@example.com', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns the user without its password and a signed token', async () => {
      const users = makeUsersService();
      users.findByEmail.mockResolvedValue(user({ password: await bcrypt.hash('right', 4) }));

      const result = await serviceWith(users, makeJwtService()).signin(
        'kiru@example.com',
        'right',
      );

      expect(result.token).toBe('signed.jwt');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('kiru@example.com');
    });
  });

  describe('getMe', () => {
    it('never leaks the password hash', async () => {
      const users = makeUsersService();
      users.findById.mockResolvedValue(user());

      const result = await serviceWith(users, makeJwtService()).getMe('u1');

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe('u1');
    });
  });
});
