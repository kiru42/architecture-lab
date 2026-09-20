import React, { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Comment } from '../../../shared/types';
import { commentApi } from '../../../entities/comment/api';
import { useCommentStore } from '../../../entities/comment/model/store';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [loading, setLoading] = useState(false);
  
  const removeComment = useCommentStore((state) => state.removeComment);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setLoading(true);
    try {
      await commentApi.delete(comment.id);
      removeComment(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div data-testid="comment-item" className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-800 mb-2">{comment.content}</p>
          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
        </div>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading}
          className="ml-4"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
