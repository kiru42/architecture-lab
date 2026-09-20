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
