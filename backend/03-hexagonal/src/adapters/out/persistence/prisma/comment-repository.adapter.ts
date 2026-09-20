import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../../../../domain/ports/secondary/comment.repository.interface';
import { Comment } from '../../../../domain/model/comment.entity';
import { PrismaService } from './prisma.service';

/** Driven adapter: implements the ICommentRepository port on top of Prisma. */
@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(content: string, taskId: string, authorId: string): Promise<Comment> {
    const row = await this.prisma.comment.create({ data: { content, taskId, authorId } });
    return new Comment(row);
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => new Comment(row));
  }

  /** Only the author may delete their own comment. */
  async delete(id: string, authorId: string): Promise<void> {
    const row = await this.prisma.comment.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Comment not found');
    }
    if (row.authorId !== authorId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }
    await this.prisma.comment.delete({ where: { id } });
  }
}
