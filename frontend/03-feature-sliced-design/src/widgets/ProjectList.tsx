import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectItem } from '../features/projects/ui/ProjectItem';
import { ProjectForm } from '../features/projects/ui/ProjectForm';
import { Card } from '../shared/ui/Card';
import { projectApi } from '../entities/project/api';
import { useProjectStore } from '../entities/project/model/store';

export const ProjectList: React.FC = () => {
  const { projects, isLoading, setProjects, setLoading, setError } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const response = await projectApi.getAll();
        setProjects(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [setProjects, setLoading, setError]);

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <ProjectForm />
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
        {activeProjects.length === 0 ? (
          <p className="text-gray-500">No active projects. Create one above!</p>
        ) : (
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onSelect={() => navigate(`/tasks/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {archivedProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Archived Projects</h2>
          <div className="space-y-4">
            {archivedProjects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onSelect={() => navigate(`/tasks/${project.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
