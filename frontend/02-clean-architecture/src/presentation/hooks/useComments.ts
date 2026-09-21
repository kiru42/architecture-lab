import { useCallback, useEffect, useState } from 'react';
import { Comment } from '@domain/entities';
import { container } from '@infrastructure/di/container';

const listCommentsUseCase = container.listCommentsUseCase();
const createCommentUseCase = container.createCommentUseCase();
const deleteCommentUseCase = container.deleteCommentUseCase();

/** Comments hang off a single task; with no task selected there is nothing to load. */
export function useComments(taskId: string | null, token: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!taskId || !token) {
      setComments([]);
      return;
    }
    try {
      setComments(await listCommentsUseCase.execute(taskId, token));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    }
  }, [taskId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createComment = useCallback(
    async (content: string) => {
      if (!taskId || !token) return;
      await createCommentUseCase.execute(content, taskId, token);
      await refresh();
    },
    [taskId, token, refresh],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      if (!token) return;
      await deleteCommentUseCase.execute(id, token);
      await refresh();
    },
    [token, refresh],
  );

  return { comments, error, createComment, deleteComment };
}
