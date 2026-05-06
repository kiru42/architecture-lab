import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let projectsService: ProjectsService;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProjectsService = {
    getProjectById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listTasks', () => {
    it('should return tasks for a project owned by user', async () => {
      const userId = 'user1';
      const projectId = 'proj1';
      const project = { id: projectId, userId };
      const tasks = [
        {
          id: 'task1',
          title: 'Task 1',
          projectId,
          completed: false,
          description: null,
          dueDate: null,
          assigneeId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProjectsService.getProjectById.mockResolvedValue(project);
      mockPrismaService.task.findMany.mockResolvedValue(tasks);

      const result = await service.listTasks(userId, projectId);

      expect(projectsService.getProjectById).toHaveBeenCalledWith(projectId);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(tasks);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockProjectsService.getProjectById.mockResolvedValue(null);

      await expect(service.listTasks('user1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own project', async () => {
      const project = { id: 'proj1', userId: 'otherUser' };
      mockProjectsService.getProjectById.mockResolvedValue(project);

      await expect(service.listTasks('user1', 'proj1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createTask', () => {
    it('should create a task in a project owned by user', async () => {
      const userId = 'user1';
      const projectId = 'proj1';
      const project = { id: projectId, userId };
      const createDto = { title: 'New Task', description: 'Description' };
      const createdTask = {
        id: 'task1',
        title: createDto.title,
        description: createDto.description,
        projectId,
        completed: false,
        dueDate: null,
        assigneeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProjectsService.getProjectById.mockResolvedValue(project);
      mockPrismaService.task.create.mockResolvedValue(createdTask);

      const result = await service.createTask(userId, projectId, createDto);

      expect(projectsService.getProjectById).toHaveBeenCalledWith(projectId);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          description: createDto.description,
          projectId,
        },
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task in a project owned by user', async () => {
      const userId = 'user1';
      const taskId = 'task1';
      const updateDto = { title: 'Updated', completed: true };

      const existingTask = {
        id: taskId,
        projectId: 'proj1',
        title: 'Old',
        completed: false,
      };

      const project = { id: 'proj1', userId };

      const updatedTask = {
        ...existingTask,
        ...updateDto,
        updatedAt: new Date(),
      };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockProjectsService.getProjectById.mockResolvedValue(project);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.updateTask(userId, taskId, updateDto);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(projectsService.getProjectById).toHaveBeenCalledWith(existingTask.projectId);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateDto,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.updateTask('user1', 'nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own project', async () => {
      const existingTask = { id: 'task1', projectId: 'proj1' };
      const project = { id: 'proj1', userId: 'otherUser' };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockProjectsService.getProjectById.mockResolvedValue(project);

      await expect(service.updateTask('user1', 'task1', {})).rejects.toThrow(ForbiddenException);
    });
  });
});
