export class CommentContent {
  private constructor(private readonly value: string) {}

  static create(value: string): CommentContent {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length === 0) {
      throw new Error('CommentContent cannot be empty');
    }
    if (trimmed.length > 2000) {
      throw new Error('CommentContent too long (max 2000 chars)');
    }
    return new CommentContent(trimmed);
  }

  getValue(): string {
    return this.value;
  }
}
