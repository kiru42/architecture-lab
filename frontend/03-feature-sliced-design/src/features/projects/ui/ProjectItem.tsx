import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Project } from '../../../shared/types';
import { projectApi } from '../../../entities/project/api';
import { useProjectStore } from '../../../entities/project/model/store';

interface ProjectItemProps {
  project: Project;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { updateProject, removeProject } = useProjectStore();

  const handleArchive = async () => {
    setLoading(true);
    try {
      const response = await projectApi.update(project.id, { archived: !project.archived });
      updateProject(project.id, response.project);
    } catch (err) {
      console.error('Failed to archive project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setLoading(true);
    try {
      await projectApi.delete(project.id);
      removeProject(project.id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTasks = () => {
    navigate(`/tasks/${project.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
          <p className="text-sm text-gray-500">
            {project.archived ? (
              <span className="text-orange-600 font-medium">Archived</span>
            ) : (
              <span className="text-green-600 font-medium">Active</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleViewTasks}
            disabled={loading}
          >
            View Tasks
          </Button>
          <Button
            variant="secondary"
            onClick={handleArchive}
            disabled={loading}
          >
            {project.archived ? 'Unarchive' : 'Archive'}
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
