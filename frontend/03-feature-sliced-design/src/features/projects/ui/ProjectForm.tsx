import React, { useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { projectApi } from '../../../entities/project/api';
import { useProjectStore } from '../../../entities/project/model/store';

interface ProjectFormProps {
  onSuccess?: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const addProject = useProjectStore((state) => state.addProject);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // POST /projects returns the bare Project.
      const project = await projectApi.create({ name });
      addProject(project);
      setName('');
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        data-testid="project-create-toggle"
        onClick={() => setIsOpen(true)}
      >
        + New Project
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        label="Project Name"
        data-testid="project-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter project name"
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" data-testid="project-submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
};
