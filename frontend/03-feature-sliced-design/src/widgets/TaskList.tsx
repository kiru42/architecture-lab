import React, { useEffect, useState } from 'react';
import { TaskItem } from '../features/tasks/ui/TaskItem';
import { TaskForm } from '../features/tasks/ui/TaskForm';
import { CommentSection } from './CommentSection';
import { Card } from '../shared/ui/Card';
import { Button } from '../shared/ui/Button';
import { taskApi } from '../entities/task/api';
import { useTaskStore } from '../entities/task/model/store';
import { Task } from '../shared/types';

interface TaskListProps {
  projectId: string;
}

/**
 * The widget layer is where a task and its comments meet: `TaskItem` is a
 * feature and may not know about `CommentSection`, which is a widget. Composing
 * them here keeps the slice boundaries intact.
 */
export const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const { tasks, isLoading, setTasks, setLoading, setError } = useTaskStore();
  const [commentsFor, setCommentsFor] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const tasks = await taskApi.getByProject(projectId);
        setTasks(tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId, setTasks, setLoading, setError]);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const renderTask = (task: Task) => (
    <div key={task.id} data-testid="task-item" className="space-y-2">
      <TaskItem task={task} />
      <Button
        variant="secondary"
        data-testid="task-select"
        onClick={() => setCommentsFor(commentsFor === task.id ? null : task.id)}
      >
        {commentsFor === task.id ? 'Hide comments' : 'Comments'}
      </Button>
      {commentsFor === task.id && <CommentSection taskId={task.id} />}
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <TaskForm projectId={projectId} />
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Active Tasks</h2>
        {activeTasks.length === 0 ? (
          <p className="text-gray-500">No active tasks. Create one above!</p>
        ) : (
          <div className="space-y-4">{activeTasks.map(renderTask)}</div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>
          <div className="space-y-4">{completedTasks.map(renderTask)}</div>
        </div>
      )}
    </div>
  );
};
