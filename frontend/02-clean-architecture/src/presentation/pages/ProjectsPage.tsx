import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@domain/entities';
import { container } from '@infrastructure/di/container';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { token } = useAuth();
  const listProjectsUseCase = container.listProjectsUseCase();
  const createProjectUseCase = container.createProjectUseCase();
  const updateProjectUseCase = container.updateProjectUseCase();
  const deleteProjectUseCase = container.deleteProjectUseCase();

  const loadProjects = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const projectsList = await listProjectsUseCase.execute(token);
      setProjects(projectsList);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [token]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !token) return;

    try {
      setIsCreating(true);
      await createProjectUseCase.execute(newProjectName.trim(), token);
      setNewProjectName('');
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleArchiveProject = async (project: Project) => {
    if (!token) return;
    try {
      await updateProjectUseCase.execute(project.id, { archived: !project.archived }, token);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    if (!token) return;
    try {
      await deleteProjectUseCase.execute(project.id, token);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Projects</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreateProject} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isCreating || !newProjectName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isCreating ? 'Creating...' : 'Create Project'}
          </button>
        </form>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Projects</h2>
              {activeProjects.length === 0 ? (
                <p className="text-gray-500">No active projects. Create one to get started!</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow p-6">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-2">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleArchiveProject(project)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {archivedProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Archived Projects</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {archivedProjects.map((project) => (
                    <div key={project.id} className="bg-gray-100 rounded-lg shadow p-6">
                      <p className="text-lg font-semibold text-gray-700">{project.name}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Archived {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleArchiveProject(project)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
