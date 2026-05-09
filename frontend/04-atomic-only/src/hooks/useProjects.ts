import { useState, useEffect } from 'react';
import { Project } from '../types';
import { projectService } from '../services/projectService';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { projects } = await projectService.getProjects();
      setProjects(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (name: string) => {
    try {
      const { project } = await projectService.createProject(name);
      setProjects((prev) => [...prev, project]);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: string, data: { name?: string; archived?: boolean }) => {
    try {
      const { project } = await projectService.updateProject(id, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  };

  return { projects, loading, error, createProject, updateProject, deleteProject, refetch: loadProjects };
}
