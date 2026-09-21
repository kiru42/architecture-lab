import { useState } from 'react';
import { Task } from '@domain/entities';
import { useAuth } from '../contexts/auth-context';
import { useComments } from '../hooks/useComments';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
}

/**
 * Task detail overlay. Comments belong to the task, so the panel is where they
 * are read and written; the list above stays a summary.
 */
export function TaskDetail({ task, onClose, onUpdate }: TaskDetailProps) {
  const { token } = useAuth();
  const { comments, createComment, deleteComment } = useComments(task.id, token);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment(newComment);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold flex-1">{task.title}</h2>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-gray-700 p-2 rounded">{task.description || 'No description'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <button
                onClick={() => onUpdate(task.id, { completed: !task.completed })}
                className={`px-4 py-2 rounded-md ${
                  task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {task.completed ? 'Completed' : 'In Progress'}
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  data-testid="comment-content"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  data-testid="comment-submit"
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Comment
                </button>
              </form>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} data-testid="comment-item" className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <p className="flex-1 text-gray-700">{comment.content}</p>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="ml-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
