import React, { useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { taskApi } from '../../../entities/task/api';
import { useTaskStore } from '../../../entities/task/model/store';

interface TaskFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ projectId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await taskApi.create({
        title,
        description,
        projectId,
        dueDate: dueDate || undefined,
      });
      addTask(response.task);
      setTitle('');
      setDescription('');
      setDueDate('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
          required
        />
      </div>
      <Input
        type="date"
        label="Due Date (Optional)"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
};
