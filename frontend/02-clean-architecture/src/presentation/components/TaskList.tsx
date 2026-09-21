import { Task } from '@domain/entities';

interface TaskListProps {
  tasks: Task[];
  onSelect: (task: Task) => void;
  onToggleCompletion: (task: Task) => Promise<void>;
  selectedTaskId: string | null;
}

export function TaskList({ tasks, onSelect, onToggleCompletion, selectedTaskId }: TaskListProps) {
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
            data-testid="task-item"
            className={`p-4 rounded-lg border ${
              selectedTaskId === task.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Controlled checkbox: the box only flips once the PATCH comes
                  back and the list is refetched, so its state is the server's. */}
              <input
                type="checkbox"
                data-testid="task-toggle"
                checked={task.completed}
                onChange={() => onToggleCompletion(task)}
                className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
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
                  {task.dueDate && (
                    <p className="mt-1 text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
