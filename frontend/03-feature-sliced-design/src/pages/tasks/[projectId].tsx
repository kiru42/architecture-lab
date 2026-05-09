import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { TaskList } from '../../widgets/TaskList';

const TasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <div>Project ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        <TaskList projectId={projectId} />
      </div>
    </div>
  );
};

export default TasksPage;
