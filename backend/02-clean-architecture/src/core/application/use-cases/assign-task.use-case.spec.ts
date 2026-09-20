import { Test } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AssignTaskUseCase } from './assign-task.use-case';
import {
  TaskRepository,
  ProjectRepository,
  UserRepository,
  Task,
  Project,
  User,
} from '../../domain';

describe('AssignTaskUseCase', () => {
  let useCase: AssignTaskUseCase;
  let mockTaskRepo: jest.Mocked<TaskRepository>;
  let mockProjectRepo: jest.Mocked<ProjectRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    mockTaskRepo = {
      findById: jest.fn(),
      findAllByProjectId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    mockProjectRepo = {
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProjectRepository>;

    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    const module = await Test.createTestingModule({
      providers: [
        AssignTaskUseCase,
        { provide: TaskRepository, useValue: mockTaskRepo },
        { provide: ProjectRepository, useValue: mockProjectRepo },
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    useCase = module.get(AssignTaskUseCase);
  });

  it('should assign a task to a user', async () => {
    const task = new Task(
      'task-123',
      'My Task',
      null,
      false,
      null,
      'proj-123',
      null,
      new Date(),
      new Date(),
    );
    const project = new Project(
      'proj-123',
      'My Project',
      false,
      'owner-123',
      new Date(),
      new Date(),
    );
    const assignee = new User(
      'assignee-123',
      'assignee@example.com',
      'hashed',
      'Assignee',
      new Date(),
      new Date(),
    );

    mockTaskRepo.findById.mockResolvedValue(task);
    mockProjectRepo.findById.mockResolvedValue(project);
    mockUserRepo.findById.mockResolvedValue(assignee);
    mockTaskRepo.save.mockResolvedValue(task);

    const result = await useCase.execute({
      taskId: 'task-123',
      assigneeId: 'assignee-123',
      userId: 'owner-123', // Project owner
    });

    expect(result.success).toBe(true);
    expect(mockTaskRepo.save).toHaveBeenCalledWith(task);
    expect(task.assigneeId).toBe('assignee-123');
  });

  it('should throw NotFoundException if task not found', async () => {
    mockTaskRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        taskId: 'invalid',
        assigneeId: 'assignee-123',
        userId: 'user-123',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user does not own project', async () => {
    const task = new Task(
      'task-123',
      'My Task',
      null,
      false,
      null,
      'proj-123',
      null,
      new Date(),
      new Date(),
    );
    const project = new Project(
      'proj-123',
      'My Project',
      false,
      'owner-123', // Different owner
      new Date(),
      new Date(),
    );

    mockTaskRepo.findById.mockResolvedValue(task);
    mockProjectRepo.findById.mockResolvedValue(project);

    await expect(
      useCase.execute({
        taskId: 'task-123',
        assigneeId: 'assignee-123',
        userId: 'attacker-123', // Not the owner
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if assignee not found', async () => {
    const task = new Task(
      'task-123',
      'My Task',
      null,
      false,
      null,
      'proj-123',
      null,
      new Date(),
      new Date(),
    );
    const project = new Project(
      'proj-123',
      'My Project',
      false,
      'owner-123',
      new Date(),
      new Date(),
    );

    mockTaskRepo.findById.mockResolvedValue(task);
    mockProjectRepo.findById.mockResolvedValue(project);
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        taskId: 'task-123',
        assigneeId: 'invalid',
        userId: 'owner-123',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
