import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { DashboardLayout } from '../templates/DashboardLayout';
import { ProjectForm } from '../organisms/ProjectForm';
import { ProjectList } from '../organisms/ProjectList';
import { TaskForm } from '../organisms/TaskForm';
import { TaskList } from '../organisms/TaskList';
import { CommentSection } from '../organisms/CommentSection';
import { Card } from '../atoms/Card';
import { Project, Task } from '../../types';

export function Dashboard() {
  const { user } = useAuth();
  const { projects, createProject, updateProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, createTask, updateTask } = useTasks(selectedProject?.id ?? null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedTask(null);
  };

  const handleCreateProject = async (name: string) => {
    await createProject(name);
  };

  const handleUpdateProject = async (id: string, data: { name?: string; archived?: boolean }) => {
    await updateProject(id, data);
  };

  const handleCreateTask = async (title: string, description: string, projectId: string) => {
    await createTask(title, description, projectId);
  };

  const handleUpdateTask = async (id: string, data: { completed?: boolean }) => {
    const updated = await updateTask(id, data);
    // Keep the open detail panel in step with the list after a toggle.
    setSelectedTask((current) => (current && current.id === id ? updated : current));
  };

  return (
    <DashboardLayout userName={user?.name}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Projects</h2>
          <ProjectForm onSubmit={handleCreateProject} />
          <ProjectList
            projects={projects}
            onSelect={handleSelectProject}
            onUpdate={handleUpdateProject}
            selectedProjectId={selectedProject?.id ?? null}
          />
        </div>

        {/* Tasks column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            {selectedProject ? selectedProject.name : 'Select a project'}
          </h2>
          {selectedProject ? (
            <>
              <TaskForm projectId={selectedProject.id} onSubmit={handleCreateTask} />
              <TaskList
                tasks={tasks}
                onSelect={setSelectedTask}
                onUpdate={handleUpdateTask}
                selectedTaskId={selectedTask?.id ?? null}
              />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">Select a project to view tasks</div>
          )}
        </div>

        {/* Task detail column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Task Details</h2>
          {selectedTask ? (
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                  <p className="text-gray-600 mt-2">
                    {selectedTask.description || 'No description'}
                  </p>
                </div>
                <CommentSection taskId={selectedTask.id} />
              </div>
            </Card>
          ) : (
            <div className="text-center py-12 text-gray-500">Select a task to view details</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}