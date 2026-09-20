export class GetCommentsQuery {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
