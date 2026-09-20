import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { DashboardLayout } from '../templates/DashboardLayout';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Project } from '../../types';

export function Dashboard() {
  const { user } = useAuth();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, createTask, updateTask, deleteTask } = useTasks(selectedProject?.id || null);
  const [projectName, setProjectName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    await createProject(projectName);
    setProjectName('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProject) return;
    await createTask(taskTitle, taskDesc, selectedProject.id);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <DashboardLayout userName={user?.name}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Projects</h2>
          <form onSubmit={handleCreateProject} className="flex gap-2">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="New project name"
            />
            <Button type="submit">Create</Button>
          </form>
          <div className="space-y-2">
            {projects.map((p) => (
              <Card
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className={selectedProject?.id === p.id ? 'ring-2 ring-blue-500' : ''}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{p.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        updateProject(p.id, { archived: !p.archived });
                      }}
                    >
                      {p.archived ? 'Restore' : 'Archive'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (confirm('Delete project?')) deleteProject(p.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            {selectedProject ? selectedProject.name : 'Select a project'}
          </h2>
          {selectedProject && (
            <>
              <form onSubmit={handleCreateTask} className="space-y-2">
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
                <Input
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Description (optional)"
                />
                <Button type="submit" className="w-full">Create Task</Button>
              </form>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <Card key={t.id}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-medium ${t.completed ? 'line-through text-gray-500' : ''}`}>
                            {t.title}
                          </h4>
                          {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => updateTask(t.id, { completed: !t.completed })}
                        >
                          {t.completed ? 'Reopen' : 'Complete'}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            if (confirm('Delete task?')) deleteTask(t.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
