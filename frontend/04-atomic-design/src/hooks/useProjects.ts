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
      // The contract returns a bare array, not a `{ projects }` envelope.
      const projects = await projectService.getProjects();
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
      const project = await projectService.createProject(name);
      setProjects((prev) => [...prev, project]);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: string, data: { name?: string; archived?: boolean }) => {
    try {
      const project = await projectService.updateProject(id, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  };

  return { projects, loading, error, createProject, updateProject, refetch: loadProjects };
}