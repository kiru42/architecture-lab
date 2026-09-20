export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly projectId: string,
    public readonly userId: string,
    public readonly options: {
      description?: string | null;
      dueDate?: Date | null;
      assigneeId?: string | null;
    } = {},
  ) {}
}
