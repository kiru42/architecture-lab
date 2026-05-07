import { Project } from '../../src/contexts/project-management/domain/aggregates/project.aggregate';
import { ProjectId } from '../../src/contexts/project-management/domain/value-objects/project-id.vo';
import { ProjectName } from '../../src/contexts/project-management/domain/value-objects/project-name.vo';

describe('Project Aggregate', () => {
  it('should create a project and emit ProjectCreatedEvent', () => {
    const id = ProjectId.generate();
    const name = ProjectName.create('My Project');
    const description = 'Test description';
    const ownerId = 'user-123';

    const project = Project.create(id, name, description, ownerId);

    expect(project.getName().getValue()).toBe('My Project');
    expect(project.isOwnedBy('user-123')).toBe(true);
    expect(project.getDomainEvents()).toHaveLength(1);
    expect(project.getDomainEvents()[0].eventName).toBe('ProjectCreated');
  });

  it('should update project info', async () => {
    const id = ProjectId.generate();
    const project = Project.create(ProjectId.generate(), ProjectName.create('Old'), null, 'user-1');
    const oldUpdatedAt = project.getUpdatedAt();

    await new Promise((r) => setTimeout(r, 10));
    project.updateInfo(ProjectName.create('New Name'), 'New description');

    expect(project.getName().getValue()).toBe('New Name');
    expect(project.getDescription()).toBe('New description');
    expect(project.getUpdatedAt().getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
  });
});
