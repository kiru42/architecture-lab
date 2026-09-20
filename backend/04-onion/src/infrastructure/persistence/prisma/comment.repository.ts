import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Comment } from '../../../core/domain/entities/comment.entity';
import { ICommentRepository } from '../../../core/application/interfaces/comment-repository.interface';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(comment: Comment): Promise<Comment> {
    const raw = await this.prisma.comment.create({
      data: { content: comment.content, taskId: comment.taskId, authorId: comment.authorId },
    });
    return PrismaCommentRepository.toDomain(raw);
  }

  async findById(id: string): Promise<Comment | null> {
    const raw = await this.prisma.comment.findUnique({ where: { id } });
    return raw ? PrismaCommentRepository.toDomain(raw) : null;
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const raws = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    return raws.map(PrismaCommentRepository.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  private static toDomain(raw: {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Comment {
    return new Comment(raw.id, raw.content, raw.taskId, raw.authorId, raw.createdAt, raw.updatedAt);
  }
}
