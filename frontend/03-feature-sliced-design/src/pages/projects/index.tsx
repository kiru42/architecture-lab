import React, { useState } from 'react';
import { Project } from '../../shared/types';
import { ProjectList } from '../../widgets/ProjectList';
import { TaskList } from '../../widgets/TaskList';

/**
 * Projects and their tasks live on one page. Selection is component state, so
 * reloading keeps the user exactly where they were instead of dropping them on
 * a task view whose parent project is no longer on screen.
 */
const ProjectsPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-8">Projects</h1>
            <ProjectList
              selectedProjectId={selectedProject?.id ?? null}
              onSelect={setSelectedProject}
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">
              {selectedProject ? selectedProject.name : 'Select a project'}
            </h2>
            {selectedProject ? (
              <TaskList projectId={selectedProject.id} />
            ) : (
              <p className="text-gray-500">Select a project to view its tasks.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
