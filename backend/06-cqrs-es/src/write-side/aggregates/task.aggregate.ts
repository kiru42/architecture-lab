import { AggregateRoot } from './aggregate-root';
import { IEvent } from '../../shared/events/event.interface';
import {
  TaskAssignedEvent,
  TaskCompletedEvent,
  TaskCreatedEvent,
  TaskReopenedEvent,
  TaskUpdatedEvent,
} from '../../shared/events/task.events';

export class Task extends AggregateRoot {
  private title: string | null = null;
  private description: string | null = null;
  private completed = false;
  private dueDate: Date | null = null;
  private projectId: string | null = null;
  private assigneeId: string | null = null;
  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();

  private constructor(id: string) {
    super(id);
  }

  static create(
    id: string,
    title: string,
    projectId: string,
    options: { description?: string | null; dueDate?: Date | null; assigneeId?: string | null } = {},
  ): Task {
    const task = new Task(id);
    task.applyEvent(
      new TaskCreatedEvent(
        id,
        {
          title,
          description: options.description ?? null,
          dueDate: options.dueDate ?? null,
          assigneeId: options.assigneeId ?? null,
          projectId,
        },
        1,
      ),
    );
    return task;
  }

  static fromHistory(id: string, events: IEvent[]): Task {
    const task = new Task(id);
    task.loadFromHistory(events);
    return task;
  }

  update(changes: { title?: string; description?: string | null; dueDate?: Date | null }): void {
    this.applyEvent(new TaskUpdatedEvent(this.id, changes, this._nextVersion()));
  }

  complete(): void {
    if (this.completed) return;
    this.applyEvent(new TaskCompletedEvent(this.id, this._nextVersion()));
  }

  reopen(): void {
    if (!this.completed) return;
    this.applyEvent(new TaskReopenedEvent(this.id, this._nextVersion()));
  }

  assignTo(assigneeId: string | null): void {
    if (this.assigneeId === assigneeId) return;
    this.applyEvent(new TaskAssignedEvent(this.id, assigneeId, this._nextVersion()));
  }

  getTitle(): string | null { return this.title; }
  getDescription(): string | null { return this.description; }
  isCompleted(): boolean { return this.completed; }
  getDueDate(): Date | null { return this.dueDate; }
  getProjectId(): string | null { return this.projectId; }
  getAssigneeId(): string | null { return this.assigneeId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  private _nextVersion(): number {
    return this.getVersion() + this.getUncommittedEvents().length + 1;
  }

  protected getEventHandler(eventType: string): ((event: IEvent) => void) | null {
    switch (eventType) {
      case 'TaskCreated':
        return this.onCreated;
      case 'TaskUpdated':
        return this.onUpdated;
      case 'TaskCompleted':
        return this.onCompleted;
      case 'TaskReopened':
        return this.onReopened;
      case 'TaskAssigned':
        return this.onAssigned;
      default:
        return null;
    }
  }

  private onCreated(event: IEvent): void {
    this.title = event.data.title;
    this.description = event.data.description;
    this.dueDate = event.data.dueDate;
    this.assigneeId = event.data.assigneeId;
    this.projectId = event.data.projectId;
    this.completed = false;
    this.createdAt = event.timestamp;
    this.updatedAt = event.timestamp;
  }

  private onUpdated(event: IEvent): void {
    if (event.data.title !== undefined) this.title = event.data.title;
    if (event.data.description !== undefined) this.description = event.data.description;
    if (event.data.dueDate !== undefined) this.dueDate = event.data.dueDate;
    this.updatedAt = event.timestamp;
  }

  private onCompleted(event: IEvent): void {
    this.completed = true;
    this.updatedAt = event.timestamp;
  }

  private onReopened(event: IEvent): void {
    this.completed = false;
    this.updatedAt = event.timestamp;
  }

  private onAssigned(event: IEvent): void {
    this.assigneeId = event.data.assigneeId;
    this.updatedAt = event.timestamp;
  }
}
