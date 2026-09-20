import React from 'react';
import { useNotifications } from '../entities/notification';
import { Card } from '../shared/ui/Card';
import { Button } from '../shared/ui/Button';

/**
 * Renders the notification entity slice. `notification-status` carries the
 * socket state: "connected" cannot be inferred from an empty list, and the
 * caller has to know when the handshake is done before acting.
 */
export const NotificationCenter: React.FC = () => {
  const { notifications, dismiss, connected } = useNotifications();

  return (
    <>
      <div
        data-testid="notification-status"
        data-connected={connected ? 'yes' : 'no'}
        className="flex items-center gap-2 text-xs"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            connected ? 'bg-green-400' : 'bg-gray-400'
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
            <Card key={notification.taskId} className="flex items-center gap-4 py-3">
              <p data-testid="notification-item" className="text-sm text-gray-800">
                You have been assigned a task
              </p>
              <Button
                variant="secondary"
                data-testid="notification-dismiss"
                onClick={() => dismiss(notification.taskId)}
              >
                Dismiss
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
