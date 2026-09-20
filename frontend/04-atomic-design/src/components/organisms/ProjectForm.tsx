import { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface ProjectFormProps {
  onSubmit: (name: string) => Promise<void>;
}

export function ProjectForm({ onSubmit }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit(name);
    setName('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed border-gray-300"
        testId="project-create-toggle"
      >
        + New Project
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        testId="project-name"
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" testId="project-submit">
          Create
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}