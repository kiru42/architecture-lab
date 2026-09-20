import { Project } from './project.entity';

const newProject = () =>
  new Project({
    id: 'p1',
    name: 'TaskFlow',
    archived: false,
    userId: 'u1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('Project', () => {
  it('starts out active', () => {
    expect(newProject().archived).toBe(false);
  });

  it('archives itself', () => {
    const project = newProject();

    project.archive();

    expect(project.archived).toBe(true);
  });

  it('unarchives itself', () => {
    const project = newProject();
    project.archive();

    project.unarchive();

    expect(project.archived).toBe(false);
  });
});
