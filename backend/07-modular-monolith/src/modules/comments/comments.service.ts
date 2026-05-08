import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async assertTaskAccess(taskId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.project.userId !== userId) throw new ForbiddenException('Access denied');
  }

  async listByTask(taskId: string, userId: string): Promise<Comment[]> {
    await this.assertTaskAccess(taskId, userId);
    return this.commentsRepository.findByTaskId(taskId);
  }

  async create(taskId: string, userId: string, content: string): Promise<Comment> {
    await this.assertTaskAccess(taskId, userId);
    return this.commentsRepository.create({ content, taskId, authorId: userId });
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Access denied');
    await this.commentsRepository.delete(id);
  }
}
