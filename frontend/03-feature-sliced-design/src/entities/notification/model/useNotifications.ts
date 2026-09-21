import { useEffect } from 'react';
import { openNotificationSocket } from '../api';
import { useNotificationStore } from './store';
import { useUserStore } from '../../user/model/store';

/**
 * Subscribes to real-time task assignments while an authenticated session is
 * open, wiring the socket to the entity's zustand store.
 *
 * The subscription follows the session: it opens when the user signs in and is
 * torn down when they sign out. Reading the token once on mount is not enough —
 * the sign-in screen has no token yet, and a listener that never re-evaluates
 * its condition would stay silent for the whole session.
 */
export function useNotifications() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const notifications = useNotificationStore((state) => state.notifications);
  const connected = useNotificationStore((state) => state.connected);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const setConnected = useNotificationStore((state) => state.setConnected);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

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
      setConnected(false);
    };
  }, [isAuthenticated, addNotification, setConnected]);

  return { notifications, dismiss: dismissNotification, connected };
}
