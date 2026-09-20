export class CreateTaskCommand {
  constructor(
    public readonly taskId: string,
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

export class UpdateTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly changes: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      dueDate?: Date | null;
      assigneeId?: string | null;
    },
  ) {}
}
