import { Project } from '../src/core/domain/entities/project.entity';

describe('Project Entity', () => {
  it('should create a project', () => {
    const project = Project.create('1', 'Test Project', 'Description', 'owner-1');

    expect(project.id).toBe('1');
    expect(project.name).toBe('Test Project');
    expect(project.description).toBe('Description');
    expect(project.ownerId).toBe('owner-1');
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(project.updatedAt).toBeInstanceOf(Date);
  });

  it('should check ownership', () => {
    const project = Project.create('1', 'Test', null, 'owner-1');

    expect(project.isOwnedBy('owner-1')).toBe(true);
    expect(project.isOwnedBy('owner-2')).toBe(false);
  });

  it('should update project info', async () => {
    const project = Project.create('1', 'Original', 'Desc', 'owner-1');

    // Wait 10ms to ensure updatedAt differs
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = project.updateInfo('Updated', 'New desc');

    expect(updated.name).toBe('Updated');
    expect(updated.description).toBe('New desc');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(project.createdAt.getTime());
  });
});
