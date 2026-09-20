export class GetTasksQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}
