import { TaskAssignedNotification } from '../entities';

/**
 * A live connection to the notification gateway, as the application layer sees
 * it. The concrete socket (Socket.IO) is an infrastructure detail behind this
 * port; nothing above it imports `socket.io-client`.
 */
export interface NotificationConnection {
  onConnect(handler: () => void): void;
  onDisconnect(handler: () => void): void;
  disconnect(): void;
}

/**
 * Opens an authenticated connection and forwards `task.assigned` events.
 * Implementations must never be called without a token: an anonymous visitor
 * holds no connection.
 */
export interface INotificationSocket {
  connect(
    token: string,
    onNotification: (notification: TaskAssignedNotification) => void,
  ): NotificationConnection;
}