import { useEffect } from 'react';
import { openNotificationSocket } from '../api';
import { useNotificationStore } from './store';

/**
 * Subscribes to real-time task assignments while an authenticated session is
 * open, wiring the socket to the entity's zustand store.
 *
 * With no token there is nothing to authenticate with, so no socket is opened
 * at all — an anonymous visitor should not hold a connection to the gateway.
 * The socket is disconnected when the owning component unmounts.
 */
export function useNotifications() {
  const notifications = useNotificationStore((state) => state.notifications);
  const connected = useNotificationStore((state) => state.connected);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const setConnected = useNotificationStore((state) => state.setConnected);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    let active = true;
    const socket = openNotificationSocket(token, (notification) => {
      if (active) {
        addNotification(notification);
      }
    });

    socket.on('connect', () => {
      if (active) {
        setConnected(true);
      }
    });
    socket.on('disconnect', () => {
      if (active) {
        setConnected(false);
      }
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [addNotification, setConnected]);

  return { notifications, dismiss: dismissNotification, connected };
}