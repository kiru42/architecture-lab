import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICommentRepository } from '@domain/ports/secondary/comment.repository.interface';
import { Comment } from '@domain/model/comment.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    content: string,
    taskId: string,
    authorId: string,
  ): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: { content, taskId, authorId },
    });
    return new Comment(comment);
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((c) => new Comment(c));
  }

  async delete(id: string, authorId: string): Promise<void> {
    // Verify comment exists and belongs to author
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== authorId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
