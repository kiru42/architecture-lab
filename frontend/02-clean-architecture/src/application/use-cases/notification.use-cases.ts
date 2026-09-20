import { INotificationSocket, NotificationConnection } from '@domain/ports';
import { TaskAssignedNotification } from '@domain/entities';

export interface TaskAssignmentsSubscription {
  disconnect(): void;
}

export interface WatchTaskAssignmentsParams {
  token: string | null;
  onNotification: (notification: TaskAssignedNotification) => void;
  onConnectedChange: (connected: boolean) => void;
}

/**
 * Orchestrates the notification socket.
 *
 * With no token there is nothing to authenticate with, so no connection is
 * opened at all: an anonymous visitor must not hold a socket to the gateway.
 * The returned subscription is the caller's to close on unmount.
 */
export class WatchTaskAssignmentsUseCase {
  constructor(private readonly notificationSocket: INotificationSocket) {}

  execute(params: WatchTaskAssignmentsParams): TaskAssignmentsSubscription | null {
    if (!params.token) {
      return null;
    }

    const connection: NotificationConnection = this.notificationSocket.connect(
      params.token,
      params.onNotification,
    );

    connection.onConnect(() => params.onConnectedChange(true));
    connection.onDisconnect(() => params.onConnectedChange(false));

    return {
      disconnect: () => connection.disconnect(),
    };
  }
}