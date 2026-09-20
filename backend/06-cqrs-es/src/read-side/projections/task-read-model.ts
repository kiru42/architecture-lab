export class TaskReadModel {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public completed: boolean,
    public dueDate: Date | null,
    public readonly projectId: string,
    public assigneeId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
