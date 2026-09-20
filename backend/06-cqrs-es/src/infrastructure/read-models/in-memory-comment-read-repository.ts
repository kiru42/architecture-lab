import { Injectable } from '@nestjs/common';
import { CommentReadModel } from '../../read-side/projections/comment-read-model';

@Injectable()
export class InMemoryCommentReadRepository {
  private comments: Map<string, CommentReadModel> = new Map();

  save(comment: CommentReadModel): void {
    this.comments.set(comment.id, comment);
  }

  findById(id: string): CommentReadModel | null {
    return this.comments.get(id) || null;
  }

  findByTaskId(taskId: string): CommentReadModel[] {
    return Array.from(this.comments.values())
      .filter((c) => c.taskId === taskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  delete(id: string): void {
    this.comments.delete(id);
  }

  clear(): void {
    this.comments.clear();
  }
}
