import React, { useState } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Project } from '../../../shared/types';
import { projectApi } from '../../../entities/project/api';
import { useProjectStore } from '../../../entities/project/model/store';

interface ProjectItemProps {
  project: Project;
  onSelect: (project: Project) => void;
  selected?: boolean;
}

/**
 * One project row. There is no Delete button: `shared/openapi.yaml` has no
 * `DELETE /projects/{id}`, so deleting would be a 404 behind a label. Archive
 * goes through `PATCH /projects/{id}`, which does exist.
 */
export const ProjectItem: React.FC<ProjectItemProps> = ({ project, onSelect, selected = false }) => {
  const [loading, setLoading] = useState(false);

  const updateProject = useProjectStore((state) => state.updateProject);

  const handleArchive = async () => {
    setLoading(true);
    try {
      const updated = await projectApi.update(project.id, { archived: !project.archived });
      updateProject(project.id, updated);
    } catch (err) {
      console.error('Failed to archive project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      data-testid="project-item"
      className={`transition-shadow ${
        selected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
      } ${project.archived ? 'opacity-60' : ''}`}
    >
      <div className="flex justify-between items-start gap-2">
        <button
          type="button"
          data-testid="project-select"
          onClick={() => onSelect(project)}
          className="flex-1 text-left"
        >
          <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
          <p className="text-sm text-gray-500">
            {project.archived ? (
              <span className="text-orange-600 font-medium">Archived</span>
            ) : (
              <span className="text-green-600 font-medium">Active</span>
            )}
          </p>
        </button>
        <Button variant="secondary" onClick={handleArchive} disabled={loading}>
          {project.archived ? 'Unarchive' : 'Archive'}
        </Button>
      </div>
    </Card>
  );
};