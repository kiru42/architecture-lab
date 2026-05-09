import { useState } from 'react';
import { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onUpdate: (id: string, data: { name?: string; archived?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedProjectId: string | null;
}

export function ProjectList({ projects, onSelect, onUpdate, onDelete, selectedProjectId }: ProjectListProps) {
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
        <div
          key={project.id}
          className={`p-4 rounded-lg border ${
            selectedProjectId === project.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          } ${project.archived ? 'opacity-60' : ''}`}
        >
          {editingId === project.id ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
                autoFocus
              />
              <button
                onClick={() => handleSave(project.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelect(project)}
                className="flex-1 text-left font-medium"
              >
                {project.name}
                {project.archived && <span className="ml-2 text-sm text-gray-500">(Archived)</span>}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleArchive(project)}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  {project.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
