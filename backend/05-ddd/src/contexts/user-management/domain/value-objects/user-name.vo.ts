export class UserName {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('UserName cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('UserName too long (max 100 chars)');
    }
  }

  static create(value: string): UserName {
    return new UserName(value.trim());
  }

  getValue(): string {
    return this.value;
  }
}
