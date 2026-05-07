export class Task {
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

  static create(title: string, projectId: string, description?: string): Task {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    return new Task(
      '',
      title,
      description || null,
      false,
      null,
      projectId,
      null,
      new Date(),
      new Date(),
    );
  }

  complete(): void {
    this.completed = true;
    this.updatedAt = new Date();
  }

  uncomplete(): void {
    this.completed = false;
    this.updatedAt = new Date();
  }

  assignTo(userId: string): void {
    this.assigneeId = userId;
    this.updatedAt = new Date();
  }

  unassign(): void {
    this.assigneeId = null;
    this.updatedAt = new Date();
  }

  setDueDate(date: Date): void {
    this.dueDate = date;
    this.updatedAt = new Date();
  }

  isAssignedTo(userId: string): boolean {
    return this.assigneeId === userId;
  }

  isInProject(projectId: string): boolean {
    return this.projectId === projectId;
  }
}
