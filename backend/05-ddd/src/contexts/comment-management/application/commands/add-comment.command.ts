export class AddCommentCommand {
  constructor(
    public readonly content: string,
    public readonly taskId: string,
    public readonly authorId: string,
  ) {}
}
