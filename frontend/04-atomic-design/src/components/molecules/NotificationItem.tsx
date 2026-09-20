import { TaskAssignedNotification } from '../../types';
import { Button } from '../atoms/Button';

interface NotificationItemProps {
  notification: TaskAssignedNotification;
  onDismiss: (taskId: string) => void;
}

export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  return (
    <div
      data-testid="notification-item"
      className="flex items-center gap-4 bg-white border border-blue-200 shadow-lg rounded-lg px-4 py-3"
    >
      <p className="text-sm text-gray-800">
        {notification.assigneeName}, you have been assigned task{' '}
        <span className="font-mono">{notification.taskId}</span>
      </p>
      <Button
        variant="secondary"
        onClick={() => onDismiss(notification.taskId)}
        testId="notification-dismiss"
      >
        Dismiss
      </Button>
    </div>
  );
}