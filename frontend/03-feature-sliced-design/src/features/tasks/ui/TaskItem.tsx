import React, { useState } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Task } from '../../../shared/types';
import { taskApi } from '../../../entities/task/api';
import { useTaskStore } from '../../../entities/task/model/store';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [loading, setLoading] = useState(false);
  
  const { updateTask, removeTask } = useTaskStore();

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await taskApi.update(task.id, { completed: !task.completed });
      updateTask(task.id, response.task);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      await taskApi.delete(task.id);
      removeTask(task.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
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
            <span className={task.completed ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
              {task.completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleToggleComplete}
            disabled={loading}
          >
            {task.completed ? 'Reopen' : 'Complete'}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
