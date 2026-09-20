/** Onion layer: Domain (the centre). */
export class Comment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly taskId: string,
    public readonly authorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(content: string, taskId: string, authorId: string, now = new Date()): Comment {
    return new Comment('', content, taskId, authorId, now, now);
  }

  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }
}
