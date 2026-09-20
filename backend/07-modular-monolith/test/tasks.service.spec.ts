import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { TasksRepository } from '../src/modules/tasks/tasks.repository';
import { TasksService } from '../src/modules/tasks/tasks.service';

const makeTaskRepository = () => ({
  findByProjectId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
});

const makePrisma = () => ({
  project: { findUnique: jest.fn() },
  task: { findUnique: jest.fn() },
});

const serviceWith = (
  repository: ReturnType<typeof makeTaskRepository>,
  prisma: ReturnType<typeof makePrisma>,
) => new TasksService(repository as unknown as TasksRepository, prisma as unknown as PrismaService);

describe('TasksService', () => {
  it('refuses to list the tasks of a project that does not exist', async () => {
    const prisma = makePrisma();
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(
      serviceWith(makeTaskRepository(), prisma).listByProject('p1', 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses to list the tasks of someone else's project", async () => {
    const prisma = makePrisma();
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'someone-else' });

    await expect(
      serviceWith(makeTaskRepository(), prisma).listByProject('p1', 'u1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns the tasks of an owned project', async () => {
    const repository = makeTaskRepository();
    repository.findByProjectId.mockResolvedValue([{ id: 't1' }]);
    const prisma = makePrisma();
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });

    await expect(
      serviceWith(repository, prisma).listByProject('p1', 'u1'),
    ).resolves.toHaveLength(1);
    expect(repository.findByProjectId).toHaveBeenCalledWith('p1');
  });

  it('turns a due-date string into a Date before persisting the task', async () => {
    const repository = makeTaskRepository();
    repository.create.mockResolvedValue({ id: 't1' });
    const prisma = makePrisma();
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });

    await serviceWith(repository, prisma).create('p1', 'u1', {
      title: 'Write tests',
      dueDate: '2026-03-01T00:00:00.000Z',
    });

    const payload = repository.create.mock.calls[0][0];
    expect(payload.title).toBe('Write tests');
    expect(payload.projectId).toBe('p1');
    expect(payload.dueDate).toBeInstanceOf(Date);
  });

  it('refuses to touch a task that does not exist', async () => {
    const repository = makeTaskRepository();
    repository.findById.mockResolvedValue(null);

    await expect(
      serviceWith(repository, makePrisma()).update('t1', 'u1', { title: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to touch a task of someone else's project", async () => {
    const repository = makeTaskRepository();
    repository.findById.mockResolvedValue({ id: 't1', projectId: 'p1' });
    const prisma = makePrisma();
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'someone-else' });

    await expect(
      serviceWith(repository, prisma).update('t1', 'u1', { title: 'Nope' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
