import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { TaskAssignedNotification } from '../types';

/**
 * Subscribes to real-time task assignments while a session is open.
 *
 * With no token there is nothing to authenticate with, so no socket is opened
 * at all — an anonymous visitor should not hold a connection to the gateway.
 *
 * `connected` is exposed because "the socket is up" is not something a caller
 * can infer from the notification list: an empty list means both "connected and
 * nothing happened" and "not connected yet".
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<TaskAssignedNotification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    let active = true;
    const socket = notificationService.connect(token, (notification) => {
      setNotifications((current) => [...current, notification]);
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
  }, []);

  const dismiss = useCallback((taskId: string) => {
    setNotifications((current) => current.filter((notification) => notification.taskId !== taskId));
  }, []);

  return { notifications, dismiss, connected };
}
