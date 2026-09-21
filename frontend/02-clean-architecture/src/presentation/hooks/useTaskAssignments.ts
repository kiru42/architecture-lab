import { useEffect, useState } from 'react';
import { TaskAssignedNotification } from '@domain/entities';
import { WatchTaskAssignmentsUseCase } from '@application/use-cases';
import { container } from '@infrastructure/di/container';

// Stable reference: a fresh use case on every call would make the effect below
// tear the socket down and reopen it on each render.
const watchTaskAssignmentsUseCase: WatchTaskAssignmentsUseCase =
  container.watchTaskAssignmentsUseCase();

export interface UseTaskAssignmentsResult {
  notifications: TaskAssignedNotification[];
  connected: boolean;
  dismiss: (taskId: string) => void;
}

/**
 * Presentation binding for the notification gateway.
 *
 * Whether a connection is allowed at all is the use case's call: with no token
 * it returns no subscription, so an anonymous visitor never holds a socket.
 */
export function useTaskAssignments(token: string | null): UseTaskAssignmentsResult {
  const [notifications, setNotifications] = useState<TaskAssignedNotification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const subscription = watchTaskAssignmentsUseCase.execute({
      token,
      onNotification: (notification) => {
        // De-duplicate by task: a reconnection replays the event, and the same
        // assignment should not stack up twice in the centre.
        setNotifications((current) =>
          current.some((item) => item.taskId === notification.taskId)
            ? current
            : [...current, notification],
        );
      },
      onConnectedChange: setConnected,
    });

    return () => {
      subscription?.disconnect();
      setConnected(false);
    };
  }, [token]);

  const dismiss = (taskId: string) =>
    setNotifications((current) => current.filter((item) => item.taskId !== taskId));

  return { notifications, connected, dismiss };
}
