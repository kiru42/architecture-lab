export class CommentReadModel {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly taskId: string,
    public readonly authorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
