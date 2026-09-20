import { useNotifications } from '../../hooks/useNotifications';
import { StatusDot } from '../atoms/StatusDot';
import { NotificationItem } from '../molecules/NotificationItem';

/**
 * The live-updates surface. It owns the socket through `useNotifications`, so
 * mounting it is what opens the connection — and unmounting it closes it again.
 */
export function NotificationCenter() {
  const { notifications, dismiss, connected } = useNotifications();

  return (
    <>
      <div
        data-testid="notification-status"
        data-connected={connected ? 'yes' : 'no'}
        className="flex items-center gap-2 text-xs text-gray-500"
      >
        <StatusDot connected={connected} />
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
            <NotificationItem
              key={notification.taskId}
              notification={notification}
              onDismiss={dismiss}
            />
          ))}
        </div>
      )}
    </>
  );
}