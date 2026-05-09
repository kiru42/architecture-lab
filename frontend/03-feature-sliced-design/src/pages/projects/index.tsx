import React from 'react';
import { ProjectList } from '../../widgets/ProjectList';

const ProjectsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>
        <ProjectList />
      </div>
    </div>
  );
};

export default ProjectsPage;
