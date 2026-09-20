import { Project } from '../src/core/domain/entities/project.entity';

describe('Project (domain entity)', () => {
  it('creates an unarchived project owned by the given user', () => {
    const project = Project.create('Test Project', 'user-1');

    expect(project.name).toBe('Test Project');
    expect(project.userId).toBe('user-1');
    expect(project.archived).toBe(false);
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(project.updatedAt).toBeInstanceOf(Date);
  });

  it('knows who owns it', () => {
    const project = Project.create('Test', 'user-1');

    expect(project.isOwnedBy('user-1')).toBe(true);
    expect(project.isOwnedBy('user-2')).toBe(false);
  });

  it('archives and unarchives immutably', () => {
    const project = Project.create('Test', 'user-1');

    const archived = project.archive();
    expect(archived.archived).toBe(true);
    // the original is untouched — entities here return new instances
    expect(project.archived).toBe(false);
    expect(archived.id).toBe(project.id);

    expect(archived.unarchive().archived).toBe(false);
  });

  it('renames and refreshes updatedAt', async () => {
    const project = Project.create('Original', 'user-1');

    // ensure updatedAt can differ from createdAt
    await new Promise((resolve) => setTimeout(resolve, 10));

    const renamed = project.rename('Renamed');

    expect(renamed.name).toBe('Renamed');
    expect(project.name).toBe('Original');
    expect(renamed.updatedAt.getTime()).toBeGreaterThan(project.createdAt.getTime());
  });
});
