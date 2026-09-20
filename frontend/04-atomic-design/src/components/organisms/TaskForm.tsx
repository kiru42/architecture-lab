import { useState } from 'react';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Button } from '../atoms/Button';

interface TaskFormProps {
  projectId: string;
  onSubmit: (title: string, description: string, projectId: string) => Promise<void>;
}

export function TaskForm({ projectId, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit(title, description, projectId);
    setTitle('');
    setDescription('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed border-gray-300"
        testId="task-create-toggle"
      >
        + New Task
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        testId="task-title"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        testId="task-description"
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" testId="task-submit">
          Create
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}