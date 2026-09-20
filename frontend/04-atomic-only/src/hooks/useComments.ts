import { useCallback, useEffect, useState } from 'react';
import { Comment } from '../types';
import { commentService } from '../services/commentService';

export function useComments(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!taskId) {
      setComments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { comments } = await commentService.getComments(taskId);
      setComments(comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const createComment = async (content: string, taskId: string) => {
    try {
      const { comment } = await commentService.createComment(content, taskId);
      setComments((prev) => [...prev, comment]);
      return comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await commentService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  };

  return { comments, loading, error, createComment, deleteComment, refetch: loadComments };
}
