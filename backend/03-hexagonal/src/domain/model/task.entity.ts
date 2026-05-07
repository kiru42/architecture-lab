// Domain Entity: Task
export class Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    dueDate: Date | null;
    projectId: string;
    assigneeId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.completed = data.completed;
    this.dueDate = data.dueDate;
    this.projectId = data.projectId;
    this.assigneeId = data.assigneeId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Domain logic: mark task as complete
  markCompleted(): void {
    this.completed = true;
  }

  // Domain logic: mark task as incomplete
  markIncomplete(): void {
    this.completed = false;
  }

  // Domain logic: assign task to user
  assignTo(userId: string): void {
    this.assigneeId = userId;
  }

  // Domain logic: unassign task
  unassign(): void {
    this.assigneeId = null;
  }
}
