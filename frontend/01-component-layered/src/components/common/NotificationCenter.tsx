import { useNotifications } from '../../hooks/useNotifications';

export function NotificationCenter() {
  const { notifications, dismiss, connected } = useNotifications();

  return (
    <>
      <div
        data-testid="notification-status"
        data-connected={connected ? 'yes' : 'no'}
        className="flex items-center gap-2 text-xs text-gray-500"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            connected ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
        {connected ? 'Live updates' : 'Connecting...'}
      </div>

      {notifications.length > 0 && (
        <div
          data-testid="notification-center"
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 space-y-2"
        >
          {notifications.map((notification) => (
            <div
              key={notification.taskId}
              data-testid="notification-item"
              className="flex items-center gap-4 bg-white border border-blue-200 shadow-lg rounded-lg px-4 py-3"
            >
              <p className="text-sm text-gray-800">You have been assigned a task</p>
              <button
                onClick={() => dismiss(notification.taskId)}
                data-testid="notification-dismiss"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
