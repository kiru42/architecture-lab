import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { Comment } from '../../domain/aggregates/comment.aggregate';
import { CommentId } from '../../domain/value-objects/comment-id.vo';
import { CommentContent } from '../../domain/value-objects/comment-content.vo';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(comment: Comment): Promise<void> {
    const id = comment.getId().getValue();
    await this.prisma.comment.upsert({
      where: { id },
      create: {
        id,
        content: comment.getContent().getValue(),
        taskId: comment.getTaskId(),
        authorId: comment.getAuthorId(),
        createdAt: comment.getCreatedAt(),
        updatedAt: comment.getUpdatedAt(),
      },
      update: {
        content: comment.getContent().getValue(),
        updatedAt: comment.getUpdatedAt(),
      },
    });
  }

  async findById(id: CommentId): Promise<Comment | null> {
    const row = await this.prisma.comment.findUnique({ where: { id: id.getValue() } });
    return row ? PrismaCommentRepository.toDomain(row) : null;
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(PrismaCommentRepository.toDomain);
  }

  async delete(id: CommentId): Promise<void> {
    await this.prisma.comment.delete({ where: { id: id.getValue() } });
  }

  private static toDomain(row: {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Comment {
    return Comment.reconstitute(
      CommentId.create(row.id),
      CommentContent.create(row.content),
      row.taskId,
      row.authorId,
      row.createdAt,
      row.updatedAt,
    );
  }
}
