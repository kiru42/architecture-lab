import { io } from 'socket.io-client';
import { INotificationSocket, NotificationConnection } from '@domain/ports';
import { TaskAssignedNotification } from '@domain/entities';

/**
 * Socket.IO adapter for the notification port.
 *
 * Same-origin by default: Vite proxies `/socket.io` in development and nginx
 * proxies it in Docker, so the frontend never hardcodes a backend URL. The
 * gateway authenticates on the handshake, which is why the JWT travels in the
 * `auth` field rather than a query string — a token in a URL ends up in logs.
 */
export class SocketIoNotificationSocket implements INotificationSocket {
  connect(
    token: string,
    onNotification: (notification: TaskAssignedNotification) => void,
  ): NotificationConnection {
    const url = import.meta.env.VITE_WS_URL ?? window.location.origin;
    const socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('task.assigned', (notification: TaskAssignedNotification) => {
      onNotification(notification);
    });

    return {
      onConnect: (handler) => {
        socket.on('connect', handler);
      },
      onDisconnect: (handler) => {
        socket.on('disconnect', handler);
      },
      disconnect: () => {
        socket.disconnect();
      },
    };
  }
}