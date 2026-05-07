import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateCommentDto } from './dto/comment.dto';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
  ) {}

  async listComments(userId: string, taskId: string): Promise<Comment[]> {
    await this.verifyTaskAccess(userId, taskId);

    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createComment(userId: string, taskId: string, dto: CreateCommentDto): Promise<Comment> {
    await this.verifyTaskAccess(userId, taskId);

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        taskId,
        authorId: userId,
      },
    });
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  private async verifyTaskAccess(userId: string, taskId: string): Promise<void> {
    const task = await this.tasksService.getTaskById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
  }
}
