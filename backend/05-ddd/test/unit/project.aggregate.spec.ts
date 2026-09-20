import { Project } from '../../src/contexts/project-management/domain/aggregates/project.aggregate';
import { ProjectId } from '../../src/contexts/project-management/domain/value-objects/project-id.vo';
import { ProjectName } from '../../src/contexts/project-management/domain/value-objects/project-name.vo';

describe('Project aggregate', () => {
  const build = (userId = 'user-123') =>
    Project.create(ProjectId.generate(), ProjectName.create('My Project'), userId);

  it('creates a project and emits ProjectCreatedEvent', () => {
    const project = build();

    expect(project.getName().getValue()).toBe('My Project');
    expect(project.isArchived()).toBe(false);
    expect(project.isOwnedBy('user-123')).toBe(true);
    expect(project.isOwnedBy('someone-else')).toBe(false);
    expect(project.getDomainEvents()).toHaveLength(1);
    expect(project.getDomainEvents()[0].eventName).toBe('ProjectCreated');
  });

  it('renames and refreshes updatedAt', async () => {
    const project = build();
    const before = project.getUpdatedAt();

    await new Promise((resolve) => setTimeout(resolve, 10));
    project.rename(ProjectName.create('New Name'));

    expect(project.getName().getValue()).toBe('New Name');
    expect(project.getUpdatedAt().getTime()).toBeGreaterThan(before.getTime());
  });

  it('archives once and emits ProjectArchivedEvent', () => {
    const project = build();
    project.clearDomainEvents();

    project.archive();

    expect(project.isArchived()).toBe(true);
    expect(project.getDomainEvents().map((e) => e.eventName)).toEqual(['ProjectArchived']);
  });

  it('does not emit an event when archiving an already-archived project', () => {
    const project = build();
    project.archive();
    project.clearDomainEvents();

    project.archive();

    expect(project.getDomainEvents()).toHaveLength(0);
  });

  it('unarchives', () => {
    const project = build();
    project.archive();

    project.unarchive();

    expect(project.isArchived()).toBe(false);
  });
});
