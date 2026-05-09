import React, { useEffect } from 'react';
import { CommentItem } from '../features/comments/ui/CommentItem';
import { CommentForm } from '../features/comments/ui/CommentForm';
import { Card } from '../shared/ui/Card';
import { commentApi } from '../entities/comment/api';
import { useCommentStore } from '../entities/comment/model/store';

interface CommentSectionProps {
  taskId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const { comments, isLoading, setComments, setLoading, setError } = useCommentStore();

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const response = await commentApi.getByTask(taskId);
        setComments(response.comments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [taskId, setComments, setLoading, setError]);

  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      
      <div className="mb-6">
        <CommentForm taskId={taskId} />
      </div>

      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </Card>
  );
};
