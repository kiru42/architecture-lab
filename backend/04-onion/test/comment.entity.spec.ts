import { Comment } from '../src/core/domain/entities/comment.entity';

describe('Comment (domain entity)', () => {
  it('creates a comment authored by the given user', () => {
    const comment = Comment.create('Nice work', 'task-1', 'user-1');

    expect(comment.content).toBe('Nice work');
    expect(comment.taskId).toBe('task-1');
    expect(comment.authorId).toBe('user-1');
    expect(comment.createdAt).toBeInstanceOf(Date);
  });

  it('only recognises its own author', () => {
    const comment = Comment.create('Nice work', 'task-1', 'user-1');

    expect(comment.isAuthoredBy('user-1')).toBe(true);
    expect(comment.isAuthoredBy('user-2')).toBe(false);
  });
});
