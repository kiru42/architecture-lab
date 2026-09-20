import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { ProjectsRepository } from '../src/modules/projects/projects.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';

const project = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  name: 'TaskFlow',
  archived: false,
  userId: 'u1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const makeRepository = () => ({
  findByUserId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
});

const serviceWith = (repository: ReturnType<typeof makeRepository>) =>
  new ProjectsService(repository as unknown as ProjectsRepository);

describe('ProjectsService', () => {
  it('lists the projects of the caller', async () => {
    const repository = makeRepository();
    repository.findByUserId.mockResolvedValue([project()]);

    await expect(serviceWith(repository).listByUser('u1')).resolves.toHaveLength(1);
    expect(repository.findByUserId).toHaveBeenCalledWith('u1');
  });

  it('creates a project owned by the caller', async () => {
    const repository = makeRepository();
    repository.create.mockResolvedValue(project());

    await serviceWith(repository).create('u1', 'TaskFlow');

    expect(repository.create).toHaveBeenCalledWith({ name: 'TaskFlow', userId: 'u1' });
  });

  it('refuses to update a project that does not exist', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(null);

    await expect(serviceWith(repository).update('p1', 'u1', { name: 'Nope' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to update someone else's project", async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(project({ userId: 'someone-else' }));

    await expect(
      serviceWith(repository).update('p1', 'u1', { name: 'Nope' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('updates an owned project', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(project());
    repository.update.mockResolvedValue(project({ archived: true }));

    await serviceWith(repository).update('p1', 'u1', { archived: true });

    expect(repository.update).toHaveBeenCalledWith('p1', { archived: true });
  });
});
