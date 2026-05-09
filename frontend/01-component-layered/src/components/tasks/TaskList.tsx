import { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onSelect: (task: Task) => void;
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedTaskId: string | null;
}

export function TaskList({ tasks, onSelect, onUpdate, onDelete, selectedTaskId }: TaskListProps) {
  const handleToggleComplete = async (task: Task) => {
    await onUpdate(task.id, { completed: !task.completed });
  };

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks yet. Create one to get started!
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border ${
              selectedTaskId === task.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
                className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onSelect(task)}
                  className="text-left w-full"
                >
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="mt-1 text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </button>
              </div>
              <button
                onClick={() => onDelete(task.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
