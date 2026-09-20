import { Task } from '../../types';
import { Card } from '../atoms/Card';
import { Checkbox } from '../atoms/Checkbox';

interface TaskListProps {
  tasks: Task[];
  onSelect: (task: Task) => void;
  onUpdate: (id: string, data: { completed?: boolean }) => Promise<void>;
  selectedTaskId: string | null;
}

export function TaskList({ tasks, onSelect, onUpdate, selectedTaskId }: TaskListProps) {
  const handleToggleComplete = (task: Task) => {
    // Fire-and-forget: the checkbox is controlled by `task.completed`, so its
    // state only flips once the PATCH resolves and the hook updates the list.
    void onUpdate(task.id, { completed: !task.completed });
  };

  if (tasks.length === 0) {
    return <div className="text-center py-8 text-gray-500">No tasks yet. Create one to get started!</div>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className={selectedTaskId === task.id ? 'ring-2 ring-blue-500' : ''}>
          <div data-testid="task-item" className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onChange={() => handleToggleComplete(task)}
              testId="task-toggle"
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <button
                data-testid="task-select"
                onClick={() => onSelect(task)}
                className="text-left w-full"
              >
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600 truncate">{task.description}</p>
                )}
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}