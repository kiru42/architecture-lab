import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../database/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;
  let tasksService: TasksService;

  const mockPrismaService = {
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  };

  const mockTasksService = {
    getTaskById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listComments', () => {
    it('should return comments for a task', async () => {
      const userId = 'user1';
      const taskId = 'task1';
      const task = { id: taskId, projectId: 'proj1' };
      const project = { id: 'proj1', userId };
      const comments = [
        {
          id: 'comment1',
          content: 'Comment 1',
          taskId,
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTasksService.getTaskById.mockResolvedValue(task);
      mockPrismaService.project.findUnique.mockResolvedValue(project);
      mockPrismaService.comment.findMany.mockResolvedValue(comments);

      const result = await service.listComments(userId, taskId);

      expect(tasksService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: task.projectId },
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { taskId },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(comments);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTasksService.getTaskById.mockResolvedValue(null);

      await expect(service.listComments('user1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own project', async () => {
      const task = { id: 'task1', projectId: 'proj1' };
      const project = { id: 'proj1', userId: 'otherUser' };

      mockTasksService.getTaskById.mockResolvedValue(task);
      mockPrismaService.project.findUnique.mockResolvedValue(project);

      await expect(service.listComments('user1', 'task1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createComment', () => {
    it('should create a comment on a task', async () => {
      const userId = 'user1';
      const taskId = 'task1';
      const task = { id: taskId, projectId: 'proj1' };
      const project = { id: 'proj1', userId };
      const createDto = { content: 'New comment' };
      const createdComment = {
        id: 'comment1',
        content: createDto.content,
        taskId,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.getTaskById.mockResolvedValue(task);
      mockPrismaService.project.findUnique.mockResolvedValue(project);
      mockPrismaService.comment.create.mockResolvedValue(createdComment);

      const result = await service.createComment(userId, taskId, createDto);

      expect(tasksService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: createDto.content,
          taskId,
          authorId: userId,
        },
      });
      expect(result).toEqual(createdComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment owned by user', async () => {
      const userId = 'user1';
      const commentId = 'comment1';
      const comment = {
        id: commentId,
        authorId: userId,
        taskId: 'task1',
        content: 'Comment',
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(comment);
      mockPrismaService.comment.delete.mockResolvedValue(comment);

      await service.deleteComment(userId, commentId);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.deleteComment('user1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const comment = {
        id: 'comment1',
        authorId: 'otherUser',
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(comment);

      await expect(service.deleteComment('user1', 'comment1')).rejects.toThrow(ForbiddenException);
    });
  });
});
