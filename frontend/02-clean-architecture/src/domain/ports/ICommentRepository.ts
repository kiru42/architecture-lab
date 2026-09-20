import { Comment } from '../entities';

/**
 * Comments hang off their task: `GET` and `POST` go through
 * `/tasks/{id}/comments`. Deletion is the one place the contract exposes a
 * top-level resource, `/comments/{id}`. The create payload is `{ content }`
 * only — the backend rejects unknown fields.
 */
export interface ICommentRepository {
  list(taskId: string, token: string): Promise<Comment[]>;
  create(taskId: string, content: string, token: string): Promise<Comment>;
  delete(id: string, token: string): Promise<void>;
}