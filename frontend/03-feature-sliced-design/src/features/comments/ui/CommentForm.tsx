import React, { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { commentApi } from '../../../entities/comment/api';
import { useCommentStore } from '../../../entities/comment/model/store';

interface CommentFormProps {
  taskId: string;
  onSuccess?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ taskId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addComment = useCommentStore((state) => state.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // The task is the parent resource in the path, and the body carries
      // `content` alone — the backend rejects any unknown field.
      const comment = await commentApi.create(taskId, { content });
      addComment(comment);
      setContent('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Comment
        </label>
        <textarea
          data-testid="comment-content"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          required
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" data-testid="comment-submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
};
