export class GetTasksQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}

export class GetTaskQuery {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
