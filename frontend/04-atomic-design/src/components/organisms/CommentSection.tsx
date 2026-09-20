import { useState } from 'react';
import { useComments } from '../../hooks/useComments';
import { Textarea } from '../atoms/Textarea';
import { Button } from '../atoms/Button';

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const { comments, createComment, deleteComment } = useComments(taskId);
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Only `content` goes to the API: the route already carries the task id.
    await createComment(content, taskId);
    setContent('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          testId="comment-content"
        />
        <Button type="submit" testId="comment-submit">
          Add Comment
        </Button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} data-testid="comment-item" className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start justify-between">
              <p className="flex-1 text-gray-700">{comment.content}</p>
              <Button variant="danger" onClick={() => deleteComment(comment.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}