import { Email } from '../../src/shared-kernel/domain/value-objects/email.vo';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = Email.create('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => Email.create('invalid')).toThrow('Invalid email format');
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('should compare emails correctly', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('test@example.com');
    const email3 = Email.create('other@example.com');

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});
