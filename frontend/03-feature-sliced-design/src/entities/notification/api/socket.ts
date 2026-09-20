import { io, Socket } from 'socket.io-client';
import { TaskAssignedNotification } from '../../../shared/types';

/**
 * Same-origin by default. Vite proxies `/socket.io` in development and nginx
 * proxies it in Docker, so the frontend never needs to know where the backend
 * is. `VITE_WS_URL` is an escape hatch for a websocket on another origin.
 */
function resolveUrl(): string {
  return import.meta.env.VITE_WS_URL ?? window.location.origin;
}

/**
 * Opens an authenticated socket and forwards every `task.assigned` event.
 *
 * The gateway authenticates on the handshake, so the token travels in the
 * `auth` field rather than a query string — a token in a URL ends up in logs.
 * The caller owns the returned socket and must disconnect it.
 */
export function openNotificationSocket(
  token: string,
  onNotification: (notification: TaskAssignedNotification) => void,
): Socket {
  const socket = io(resolveUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('task.assigned', (notification: TaskAssignedNotification) => {
    onNotification(notification);
  });

  return socket;
}