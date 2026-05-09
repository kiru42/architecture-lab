import React, { useEffect } from 'react';
import { TaskItem } from '../features/tasks/ui/TaskItem';
import { TaskForm } from '../features/tasks/ui/TaskForm';
import { Card } from '../shared/ui/Card';
import { taskApi } from '../entities/task/api';
import { useTaskStore } from '../entities/task/model/store';

interface TaskListProps {
  projectId: string;
}

export const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const { tasks, isLoading, setTasks, setLoading, setError } = useTaskStore();

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await taskApi.getByProject(projectId);
        setTasks(response.tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId, setTasks, setLoading, setError]);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

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
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
