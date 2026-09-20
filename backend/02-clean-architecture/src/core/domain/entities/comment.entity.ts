export class Comment {
  constructor(
    public readonly id: string,
    public content: string,
    public readonly taskId: string,
    public readonly authorId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(content: string, taskId: string, authorId: string): Comment {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }
    return new Comment('', content.trim(), taskId, authorId, new Date(), new Date());
  }

  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }
}
