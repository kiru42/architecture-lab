import { Comment } from '../../src/contexts/comment-management/domain/aggregates/comment.aggregate';
import { CommentId } from '../../src/contexts/comment-management/domain/value-objects/comment-id.vo';
import { CommentContent } from '../../src/contexts/comment-management/domain/value-objects/comment-content.vo';

describe('Comment aggregate', () => {
  it('adds a comment and emits CommentAddedEvent', () => {
    const comment = Comment.add(
      CommentId.generate(),
      CommentContent.create('This is important'),
      'task-1',
      'user-1',
    );

    expect(comment.getContent().getValue()).toBe('This is important');
    expect(comment.getTaskId()).toBe('task-1');
    expect(comment.isAuthoredBy('user-1')).toBe(true);
    expect(comment.isAuthoredBy('user-2')).toBe(false);
    expect(comment.getDomainEvents().map((e) => e.eventName)).toEqual(['CommentAdded']);
  });

  it('trims the content', () => {
    expect(CommentContent.create('  padded  ').getValue()).toBe('padded');
  });

  it('refuses empty content', () => {
    expect(() => CommentContent.create('   ')).toThrow('CommentContent cannot be empty');
  });
});
