import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root';
import { ProjectId } from '../value-objects/project-id.vo';
import { ProjectName } from '../value-objects/project-name.vo';
import { ProjectCreatedEvent } from '../events/project-created.event';
import { ProjectArchivedEvent } from '../events/project-archived.event';

/**
 * Aggregate root for the Project bounded context.
 *
 * The aggregate has no \`description\` and no \`userId\`-vs-\`ownerId\` ambiguity:
 * it is shaped exactly like the frozen Project schema, so the repository never
 * has to invent a translation.
 */
export class Project extends AggregateRoot<ProjectId> {
  private constructor(
    id: ProjectId,
    private name: ProjectName,
    private archived: boolean,
    private readonly userId: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super(id);
  }

  static create(id: ProjectId, name: ProjectName, userId: string): Project {
    const now = new Date();
    const project = new Project(id, name, false, userId, now, now);
    project.addDomainEvent(new ProjectCreatedEvent(id.getValue(), name.getValue(), userId));
    return project;
  }

  static reconstitute(
    id: ProjectId,
    name: ProjectName,
    archived: boolean,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
  ): Project {
    return new Project(id, name, archived, userId, createdAt, updatedAt);
  }

  rename(name: ProjectName): void {
    this.name = name;
    this.touch();
  }

  archive(): void {
    if (this.archived) return;
    this.archived = true;
    this.touch();
    this.addDomainEvent(new ProjectArchivedEvent(this.id.getValue()));
  }

  unarchive(): void {
    if (!this.archived) return;
    this.archived = false;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  getId(): ProjectId { return this.id; }
  getName(): ProjectName { return this.name; }
  isArchived(): boolean { return this.archived; }
  getUserId(): string { return this.userId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  isOwnedBy(userId: string): boolean { return this.userId === userId; }
}
