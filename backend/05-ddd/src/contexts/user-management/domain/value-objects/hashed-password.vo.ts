/**
 * Value object wrapping the stored password hash.
 *
 * The frozen schema names the column \`password\`; the adapter maps between that
 * column and this VO, so the domain keeps an intention-revealing type.
 */
export class HashedPassword {
  private constructor(private readonly value: string) {
    if (!value || value.length < 10) {
      throw new Error('Invalid hashed password');
    }
  }

  static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  getValue(): string {
    return this.value;
  }
}
