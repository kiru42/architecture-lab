import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CommentsRepository } from '../src/modules/comments/comments.repository';
import { CommentsService } from '../src/modules/comments/comments.service';

const makeCommentsRepository = () => ({
  findByTaskId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
});

const makePrisma = () => ({
  task: { findUnique: jest.fn() },
});

const serviceWith = (
  repository: ReturnType<typeof makeCommentsRepository>,
  prisma: ReturnType<typeof makePrisma>,
) =>
  new CommentsService(
    repository as unknown as CommentsRepository,
    prisma as unknown as PrismaService,
  );

describe('CommentsService', () => {
  it("refuses to list the comments of someone else's task", async () => {
    const repository = makeCommentsRepository();
    const prisma = makePrisma();
    prisma.task.findUnique.mockResolvedValue({
      id: 't1',
      project: { userId: 'someone-else' },
    });

    await expect(
      serviceWith(repository, prisma).listByTask('t1', 'u1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.findByTaskId).not.toHaveBeenCalled();
  });

  it('refuses a comment on a task that does not exist', async () => {
    const prisma = makePrisma();
    prisma.task.findUnique.mockResolvedValue(null);

    await expect(
      serviceWith(makeCommentsRepository(), prisma).create('t1', 'u1', 'hello'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a comment authored by the caller', async () => {
    const repository = makeCommentsRepository();
    repository.create.mockResolvedValue({ id: 'c1', content: 'hello' });
    const prisma = makePrisma();
    prisma.task.findUnique.mockResolvedValue({ id: 't1', project: { userId: 'u1' } });

    await serviceWith(repository, prisma).create('t1', 'u1', 'hello');

    expect(repository.create).toHaveBeenCalledWith({
      content: 'hello',
      taskId: 't1',
      authorId: 'u1',
    });
  });

  it('refuses to delete a comment that does not exist', async () => {
    const repository = makeCommentsRepository();
    repository.findById.mockResolvedValue(null);

    await expect(
      serviceWith(repository, makePrisma()).delete('c1', 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("refuses to delete someone else's comment", async () => {
    const repository = makeCommentsRepository();
    repository.findById.mockResolvedValue({ id: 'c1', authorId: 'someone-else' });

    await expect(
      serviceWith(repository, makePrisma()).delete('c1', 'u1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('deletes its own comment', async () => {
    const repository = makeCommentsRepository();
    repository.findById.mockResolvedValue({ id: 'c1', authorId: 'u1' });

    await serviceWith(repository, makePrisma()).delete('c1', 'u1');

    expect(repository.delete).toHaveBeenCalledWith('c1');
  });
});
