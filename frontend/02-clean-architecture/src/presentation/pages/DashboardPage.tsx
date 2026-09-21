import { useState } from 'react';
import { Project, Task } from '@domain/entities';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { Header } from '../components/Header';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectList } from '../components/ProjectList';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskDetail } from '../components/TaskDetail';

export function DashboardPage() {
  const { token } = useAuth();
  const { projects, isLoading, error, createProject, updateProject } = useProjects(token);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, createTask, updateTask, toggleTaskCompletion } = useTasks(
    selectedProject?.id ?? null,
    token,
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Projects</h2>
            <ProjectForm onSubmit={createProject} />
            {isLoading ? (
              <p className="text-gray-500 text-sm">Loading projects...</p>
            ) : (
              <ProjectList
                projects={projects}
                onSelect={handleProjectSelect}
                onUpdate={updateProject}
                selectedProjectId={selectedProject?.id ?? null}
              />
            )}
          </div>

          {/* Tasks Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {selectedProject ? selectedProject.name : 'Select a project'}
            </h2>
            {selectedProject ? (
              <>
                <TaskForm onSubmit={createTask} />
                <TaskList
                  tasks={tasks}
                  onSelect={setSelectedTask}
                  onToggleCompletion={toggleTaskCompletion}
                  selectedTaskId={selectedTask?.id ?? null}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">Select a project to view tasks</div>
            )}
          </div>

          {/* Task Detail Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Task Details</h2>
            {selectedTask ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                  <p className="text-gray-600 mt-2">
                    {selectedTask.description || 'No description'}
                  </p>
                </div>
                <button
                  onClick={() => updateTask(selectedTask.id, { completed: !selectedTask.completed })}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedTask.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Select a task to view details</div>
            )}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}
