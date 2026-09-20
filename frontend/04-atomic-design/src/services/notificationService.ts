import { io, Socket } from 'socket.io-client';
import { TaskAssignedNotification } from '../types';

// Same-origin by default. Vite proxies /socket.io in development and nginx
// proxies it in Docker, so a frontend never needs to know where the backend is.
function resolveUrl(): string {
  return import.meta.env.VITE_WS_URL ?? window.location.origin;
}

export const notificationService = {
  /**
   * Open an authenticated socket and forward every `task.assigned` event.
   *
   * The gateway authenticates on the handshake, so the token travels in the
   * `auth` field rather than a query string — a token in a URL ends up in logs.
   * The caller owns the returned socket and must disconnect it.
   */
  connect(token: string, onNotification: (notification: TaskAssignedNotification) => void): Socket {
    const socket = io(resolveUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('task.assigned', (notification: TaskAssignedNotification) => {
      onNotification(notification);
    });

    return socket;
  },
};