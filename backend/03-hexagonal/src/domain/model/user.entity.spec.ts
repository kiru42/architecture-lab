import { User } from './user.entity';

const newUser = () =>
  new User({
    id: 'u1',
    email: 'kiru@example.com',
    password: 'hashed-secret',
    name: 'Kiru',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('User', () => {
  it('never exposes the password in its public representation', () => {
    const user = newUser();

    const publicUser = user.toPublic();

    expect(publicUser).toEqual({
      id: 'u1',
      email: 'kiru@example.com',
      name: 'Kiru',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(Object.keys(publicUser)).not.toContain('password');
  });

  it('keeps the hash on the entity itself, for the repository', () => {
    expect(newUser().password).toBe('hashed-secret');
  });
});
