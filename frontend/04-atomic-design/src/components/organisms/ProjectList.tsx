import { useState } from 'react';
import { Project } from '../../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onUpdate: (id: string, data: { name?: string; archived?: boolean }) => Promise<void>;
  selectedProjectId: string | null;
}

export function ProjectList({ projects, onSelect, onUpdate, selectedProjectId }: ProjectListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSave = async (id: string) => {
    await onUpdate(id, { name: editName });
    setEditingId(null);
  };

  const handleToggleArchive = async (project: Project) => {
    await onUpdate(project.id, { archived: !project.archived });
  };

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={
            selectedProjectId === project.id
              ? 'ring-2 ring-blue-500'
              : project.archived
                ? 'opacity-60'
                : ''
          }
        >
          <div data-testid="project-item">
            {editingId === project.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  autoFocus
                />
                <Button variant="secondary" onClick={() => handleSave(project.id)}>
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  data-testid="project-select"
                  onClick={() => onSelect(project)}
                  className="flex-1 text-left font-medium"
                >
                  {project.name}
                  {project.archived && (
                    <span className="ml-2 text-sm text-gray-500">(Archived)</span>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(project)}>
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => handleToggleArchive(project)}>
                    {project.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}