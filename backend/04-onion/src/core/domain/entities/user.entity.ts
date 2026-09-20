/**
 * Onion layer: Domain (the centre).
 *
 * User is deliberately shaped like the frozen \`User\` schema. The password hash
 * is private so it can never leak through a controller by accident — use
 * toPublic() for anything that leaves the domain.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    private readonly password: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(email: string, password: string, name: string, now = new Date()): User {
    return new User('', email, password, name, now, now);
  }

  getPasswordHash(): string {
    return this.password;
  }

  /** Domain behaviour: verify a plaintext password against the stored hash. */
  hasPasswordHash(hashToCompare: string): boolean {
    return this.password === hashToCompare;
  }

  /** The only representation allowed to leave the application. */
  toPublic(): { id: string; email: string; name: string; createdAt: Date } {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
