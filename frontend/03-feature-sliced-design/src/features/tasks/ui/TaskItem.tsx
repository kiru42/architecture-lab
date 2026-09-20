import React, { useState } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Task } from '../../../shared/types';
import { taskApi } from '../../../entities/task/api';
import { useTaskStore } from '../../../entities/task/model/store';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [loading, setLoading] = useState(false);

  const updateTask = useTaskStore((state) => state.updateTask);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      // The contract returns the Task itself, not a `{ task }` envelope.
      const updated = await taskApi.update(task.id, { completed: !task.completed });
      updateTask(task.id, updated);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <p className="text-gray-600 mb-2">{task.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            data-testid="task-toggle"
            checked={task.completed}
            onChange={handleToggleComplete}
            disabled={loading}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          {task.completed ? 'Completed' : 'In progress'}
        </label>
      </div>
    </Card>
  );
};
