import { AggregateRoot } from './aggregate-root';
import { IEvent } from '../../shared/events/event.interface';
import {
  ProjectArchivedEvent,
  ProjectCreatedEvent,
  ProjectRenamedEvent,
  ProjectUnarchivedEvent,
} from '../../shared/events/project.events';

export class Project extends AggregateRoot {
  private name: string | null = null;
  private archived = false;
  private userId: string | null = null;
  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();

  private constructor(id: string) {
    super(id);
  }

  static create(id: string, name: string, userId: string): Project {
    const project = new Project(id);
    project.applyEvent(new ProjectCreatedEvent(id, name, userId, 1));
    return project;
  }

  static fromHistory(id: string, events: IEvent[]): Project {
    const project = new Project(id);
    project.loadFromHistory(events);
    return project;
  }

  rename(name: string): void {
    this.applyEvent(new ProjectRenamedEvent(this.id, name, this._nextVersion()));
  }

  archive(): void {
    if (this.archived) return;
    this.applyEvent(new ProjectArchivedEvent(this.id, this._nextVersion()));
  }

  unarchive(): void {
    if (!this.archived) return;
    this.applyEvent(new ProjectUnarchivedEvent(this.id, this._nextVersion()));
  }

  getName(): string | null { return this.name; }
  isArchived(): boolean { return this.archived; }
  getUserId(): string | null { return this.userId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  isOwnedBy(userId: string): boolean { return this.userId === userId; }

  private _nextVersion(): number {
    return this.getVersion() + this.getUncommittedEvents().length + 1;
  }

  protected getEventHandler(eventType: string): ((event: IEvent) => void) | null {
    switch (eventType) {
      case 'ProjectCreated':
        return this.onCreated;
      case 'ProjectRenamed':
        return this.onRenamed;
      case 'ProjectArchived':
        return this.onArchived;
      case 'ProjectUnarchived':
        return this.onUnarchived;
      default:
        return null;
    }
  }

  private onCreated(event: IEvent): void {
    this.name = event.data.name;
    this.userId = event.data.userId;
    this.archived = false;
    this.createdAt = event.timestamp;
    this.updatedAt = event.timestamp;
  }

  private onRenamed(event: IEvent): void {
    this.name = event.data.name;
    this.updatedAt = event.timestamp;
  }

  private onArchived(event: IEvent): void {
    this.archived = true;
    this.updatedAt = event.timestamp;
  }

  private onUnarchived(event: IEvent): void {
    this.archived = false;
    this.updatedAt = event.timestamp;
  }
}
