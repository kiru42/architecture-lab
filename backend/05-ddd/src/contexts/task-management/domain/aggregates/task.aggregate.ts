import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root';
import { TaskId } from '../value-objects/task-id.vo';
import { TaskStatus } from '../value-objects/task-status.vo';
import { TaskCompletedEvent } from '../events/task-completed.event';
import { TaskAssignedEvent } from '../events/task-assigned.event';

/**
 * Aggregate root for the Task bounded context.
 *
 * Status is exposed as a TaskStatus value object but persisted as the frozen
 * schema's \`completed\` boolean, so switching a task between DONE and TODO is the
 * only transition the aggregate can express.
 */
export class Task extends AggregateRoot<TaskId> {
  private constructor(
    id: TaskId,
    private title: string,
    private description: string | null,
    private status: TaskStatus,
    private dueDate: Date | null,
    private readonly projectId: string,
    private assigneeId: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super(id);
  }

  static create(
    id: TaskId,
    title: string,
    projectId: string,
    options: {
      description?: string | null;
      dueDate?: Date | null;
      assigneeId?: string | null;
    } = {},
  ): Task {
    const now = new Date();
    return new Task(
      id,
      title,
      options.description ?? null,
      TaskStatus.TODO(),
      options.dueDate ?? null,
      projectId,
      options.assigneeId ?? null,
      now,
      now,
    );
  }

  static reconstitute(
    id: TaskId,
    title: string,
    description: string | null,
    status: TaskStatus,
    dueDate: Date | null,
    projectId: string,
    assigneeId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): Task {
    return new Task(
      id,
      title,
      description,
      status,
      dueDate,
      projectId,
      assigneeId,
      createdAt,
      updatedAt,
    );
  }

  rename(title: string): void {
    this.title = title;
    this.touch();
  }

  describe(description: string | null): void {
    this.description = description;
    this.touch();
  }

  reschedule(dueDate: Date | null): void {
    this.dueDate = dueDate;
    this.touch();
  }

  /** Idempotent: completing an already-completed task publishes nothing. */
  complete(): void {
    if (this.status.isDone()) return;
    this.status = TaskStatus.DONE();
    this.touch();
    this.addDomainEvent(new TaskCompletedEvent(this.id.getValue(), this.title));
  }

  reopen(): void {
    if (!this.status.isDone()) return;
    this.status = TaskStatus.TODO();
    this.touch();
  }

  assignTo(userId: string): void {
    if (this.assigneeId === userId) return;
    this.assigneeId = userId;
    this.touch();
    this.addDomainEvent(new TaskAssignedEvent(this.id.getValue(), userId, this.title));
  }

  unassign(): void {
    this.assigneeId = null;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  getId(): TaskId { return this.id; }
  getTitle(): string { return this.title; }
  getDescription(): string | null { return this.description; }
  getStatus(): TaskStatus { return this.status; }
  isCompleted(): boolean { return this.status.isDone(); }
  getDueDate(): Date | null { return this.dueDate; }
  getProjectId(): string { return this.projectId; }
  getAssigneeId(): string | null { return this.assigneeId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  belongsToProject(projectId: string): boolean { return this.projectId === projectId; }
}
