export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  static create(id: string, email: string, passwordHash: string, name: string): User {
    return new User(id, email, passwordHash, name, new Date());
  }

  verifyPassword(hashedPassword: string): boolean {
    return this.passwordHash === hashedPassword;
  }
}
