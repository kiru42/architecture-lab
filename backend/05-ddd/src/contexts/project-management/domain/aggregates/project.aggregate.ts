import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root';
import { ProjectId } from '../value-objects/project-id.vo';
import { ProjectName } from '../value-objects/project-name.vo';
import { ProjectCreatedEvent } from '../events/project-created.event';

export class Project extends AggregateRoot<ProjectId> {
  private constructor(
    id: ProjectId,
    private name: ProjectName,
    private description: string | null,
    private readonly ownerId: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super(id);
  }

  static create(id: ProjectId, name: ProjectName, description: string | null, ownerId: string): Project {
    const project = new Project(id, name, description, ownerId, new Date(), new Date());
    project.addDomainEvent(new ProjectCreatedEvent(id.getValue(), name.getValue(), ownerId));
    return project;
  }

  static reconstitute(id: ProjectId, name: ProjectName, description: string | null, ownerId: string, createdAt: Date, updatedAt: Date): Project {
    return new Project(id, name, description, ownerId, createdAt, updatedAt);
  }

  updateInfo(name?: ProjectName, description?: string | null): void {
    if (name) this.name = name;
    if (description !== undefined) this.description = description;
    this.updatedAt = new Date();
  }

  getName(): ProjectName { return this.name; }
  getDescription(): string | null { return this.description; }
  getOwnerId(): string { return this.ownerId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  isOwnedBy(userId: string): boolean { return this.ownerId === userId; }
}
