export class AddCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly content: string,
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}
