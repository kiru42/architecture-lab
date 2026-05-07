export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: TaskStatus,
    public readonly priority: TaskPriority,
    public readonly projectId: string,
    public readonly assignedToId: string | null,
    public readonly createdById: string,
    public readonly dueDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    title: string,
    description: string | null,
    priority: TaskPriority,
    projectId: string,
    createdById: string,
    dueDate: Date | null,
  ): Task {
    const now = new Date();
    return new Task(
      id,
      title,
      description,
      TaskStatus.TODO,
      priority,
      projectId,
      null,
      createdById,
      dueDate,
      now,
      now,
    );
  }

  assignTo(userId: string): Task {
    if (this.assignedToId === userId) {
      throw new Error('Task is already assigned to this user');
    }
    return new Task(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.projectId,
      userId,
      this.createdById,
      this.dueDate,
      this.createdAt,
      new Date(),
    );
  }

  updateStatus(newStatus: TaskStatus): Task {
    if (this.status === newStatus) {
      throw new Error('Task is already in this status');
    }
    return new Task(
      this.id,
      this.title,
      this.description,
      newStatus,
      this.priority,
      this.projectId,
      this.assignedToId,
      this.createdById,
      this.dueDate,
      this.createdAt,
      new Date(),
    );
  }

  isAssignedTo(userId: string): boolean {
    return this.assignedToId === userId;
  }

  belongsToProject(projectId: string): boolean {
    return this.projectId === projectId;
  }
}
