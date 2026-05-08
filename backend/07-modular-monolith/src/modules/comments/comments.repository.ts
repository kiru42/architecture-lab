import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({ where: { taskId }, orderBy: { createdAt: 'asc' } });
  }

  async create(data: { content: string; taskId: string; authorId: string }): Promise<Comment> {
    return this.prisma.comment.create({ data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}
