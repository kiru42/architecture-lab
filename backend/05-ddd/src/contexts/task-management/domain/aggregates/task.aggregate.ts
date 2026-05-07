import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root';
import { TaskId } from '../value-objects/task-id.vo';
import { TaskStatus } from '../value-objects/task-status.vo';
import { TaskCompletedEvent } from '../events/task-completed.event';

export class Task extends AggregateRoot<TaskId> {
  private constructor(
    id: TaskId,
    private title: string,
    private description: string | null,
    private status: TaskStatus,
    private readonly projectId: string,
    private readonly createdAt: Date,
  ) {
    super(id);
  }

  static create(id: TaskId, title: string, description: string | null, projectId: string): Task {
    return new Task(id, title, description, TaskStatus.TODO(), projectId, new Date());
  }

  static reconstitute(id: TaskId, title: string, description: string | null, status: TaskStatus, projectId: string, createdAt: Date): Task {
    return new Task(id, title, description, status, projectId, createdAt);
  }

  complete(): void {
    if (!this.status.isDone()) {
      this.status = TaskStatus.create('DONE');
      this.addDomainEvent(new TaskCompletedEvent(this.id.getValue(), this.title));
    }
  }

  getTitle(): string { return this.title; }
  getDescription(): string | null { return this.description; }
  getStatus(): TaskStatus { return this.status; }
  getProjectId(): string { return this.projectId; }
}
