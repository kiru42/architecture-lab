import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CommentRepository, Comment } from '../../core/domain';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Comment | null> {
    const row = await this.prisma.comment.findUnique({ where: { id } });
    return row ? PrismaCommentRepository.toDomain(row) : null;
  }

  async findAllByTaskId(taskId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(PrismaCommentRepository.toDomain);
  }

  async save(comment: Comment): Promise<Comment> {
    const data = {
      content: comment.content,
      taskId: comment.taskId,
      authorId: comment.authorId,
      updatedAt: comment.updatedAt,
    };

    const row = comment.id
      ? await this.prisma.comment.update({ where: { id: comment.id }, data })
      : await this.prisma.comment.create({ data });

    return PrismaCommentRepository.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  private static toDomain(row: {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Comment {
    return new Comment(
      row.id,
      row.content,
      row.taskId,
      row.authorId,
      row.createdAt,
      row.updatedAt,
    );
  }
}
