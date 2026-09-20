import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateTaskUseCase } from './create-task.usecase';
import { IProjectRepository } from '../../domain/ports/secondary/project.repository.interface';
import { ITaskRepository } from '../../domain/ports/secondary/task.repository.interface';
import { Project } from '../../domain/model/project.entity';
import { Task } from '../../domain/model/task.entity';

const project = (userId: string): Project =>
  new Project({
    id: 'p1',
    name: 'TaskFlow',
    archived: false,
    userId,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const task = (): Task =>
  new Task({
    id: 't1',
    title: 'Write tests',
    description: null,
    completed: false,
    dueDate: null,
    projectId: 'p1',
    assigneeId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const makeTaskRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByProjectId: jest.fn(),
  update: jest.fn(),
});

const makeProjectRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
});

const useCaseWith = (
  tasks: ReturnType<typeof makeTaskRepository>,
  projects: ReturnType<typeof makeProjectRepository>,
) =>
  new CreateTaskUseCase(
    tasks as unknown as ITaskRepository,
    projects as unknown as IProjectRepository,
  );

describe('CreateTaskUseCase', () => {
  it('refuses a task on a project that does not exist', async () => {
    const projects = makeProjectRepository();
    projects.findById.mockResolvedValue(null);

    await expect(
      useCaseWith(makeTaskRepository(), projects).execute({
        title: 'Write tests',
        projectId: 'p1',
        userId: 'u1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses a task on someone else's project", async () => {
    const projects = makeProjectRepository();
    projects.findById.mockResolvedValue(project('someone-else'));

    await expect(
      useCaseWith(makeTaskRepository(), projects).execute({
        title: 'Write tests',
        projectId: 'p1',
        userId: 'u1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates the task when the project belongs to the caller', async () => {
    const tasks = makeTaskRepository();
    tasks.create.mockResolvedValue(task());
    const projects = makeProjectRepository();
    projects.findById.mockResolvedValue(project('u1'));

    await expect(
      useCaseWith(tasks, projects).execute({
        title: 'Write tests',
        projectId: 'p1',
        userId: 'u1',
      }),
    ).resolves.toBeInstanceOf(Task);

    expect(tasks.create).toHaveBeenCalledWith({
      title: 'Write tests',
      description: undefined,
      dueDate: undefined,
      projectId: 'p1',
      assigneeId: undefined,
    });
  });
});
