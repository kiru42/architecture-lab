import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateProjectUseCase } from './update-project.usecase';
import { IProjectRepository } from '../../domain/ports/secondary/project.repository.interface';
import { Project } from '../../domain/model/project.entity';

const project = (userId: string): Project =>
  new Project({
    id: 'p1',
    name: 'TaskFlow',
    archived: false,
    userId,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const makeProjectRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
});

const useCaseWith = (projects: ReturnType<typeof makeProjectRepository>) =>
  new UpdateProjectUseCase(projects as unknown as IProjectRepository);

describe('UpdateProjectUseCase', () => {
  it('refuses to update a project that does not exist', async () => {
    const projects = makeProjectRepository();
    projects.findById.mockResolvedValue(null);

    await expect(
      useCaseWith(projects).execute('p1', 'u1', { name: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(projects.update).not.toHaveBeenCalled();
  });

  it("refuses to update someone else's project", async () => {
    const projects = makeProjectRepository();
    projects.findById.mockResolvedValue(project('someone-else'));

    await expect(
      useCaseWith(projects).execute('p1', 'u1', { name: 'Nope' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(projects.update).not.toHaveBeenCalled();
  });

  it('updates an owned project', async () => {
    const projects = makeProjectRepository();
    projects.findById.mockResolvedValue(project('u1'));
    projects.update.mockResolvedValue(project('u1'));

    await useCaseWith(projects).execute('p1', 'u1', { archived: true });

    expect(projects.update).toHaveBeenCalledWith('p1', { archived: true });
  });
});
