import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { Header } from '../components/common/Header';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { Project, Task } from '../types';

export function Dashboard() {
  const { projects, createProject, updateProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, createTask, updateTask } = useTasks(selectedProject?.id || null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedTask(null);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  // Wrappers to match component signatures (ignore return values)
  const handleCreateProject = async (name: string) => {
    await createProject(name);
  };

  const handleUpdateProject = async (id: string, data: { name?: string; archived?: boolean }) => {
    await updateProject(id, data);
  };

  const handleCreateTask = async (title: string, description: string, projectId: string) => {
    await createTask(title, description, projectId);
  };

  const handleUpdateTask = async (id: string, data: Partial<Task>) => {
    await updateTask(id, data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Projects</h2>
            </div>
            <ProjectForm onSubmit={handleCreateProject} />
            <ProjectList
              projects={projects}
              onSelect={handleProjectSelect}
              onUpdate={handleUpdateProject}
              selectedProjectId={selectedProject?.id || null}
            />
          </div>

          {/* Tasks Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedProject ? selectedProject.name : 'Select a project'}
              </h2>
            </div>
            {selectedProject && (
              <>
                <TaskForm projectId={selectedProject.id} onSubmit={handleCreateTask} />
                <TaskList
                  tasks={tasks}
                  onSelect={handleTaskSelect}
                  onUpdate={handleUpdateTask}
                  selectedTaskId={selectedTask?.id || null}
                />
              </>
            )}
            {!selectedProject && (
              <div className="text-center py-12 text-gray-500">
                Select a project to view tasks
              </div>
            )}
          </div>

          {/* Task Detail Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Task Details</h2>
            {selectedTask ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                    <p className="text-gray-600 mt-2">{selectedTask.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleUpdateTask(selectedTask.id, { completed: !selectedTask.completed })}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {selectedTask.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a task to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
}
