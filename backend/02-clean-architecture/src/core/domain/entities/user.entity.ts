export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    private password: string,
    public name: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(email: string, hashedPassword: string, name: string): User {
    return new User(
      '', // ID set by persistence layer
      email.toLowerCase(),
      hashedPassword,
      name,
      new Date(),
      new Date(),
    );
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  verifyPassword(hashedPassword: string): boolean {
    return this.password === hashedPassword;
  }

  getPassword(): string {
    return this.password;
  }
}
