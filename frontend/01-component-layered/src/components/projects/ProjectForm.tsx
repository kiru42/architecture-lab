import { useState } from 'react';

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
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
      >
        + New Project
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
