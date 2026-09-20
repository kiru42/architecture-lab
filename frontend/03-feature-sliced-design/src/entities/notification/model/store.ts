import { create } from 'zustand';
import { TaskAssignedNotification } from '../../../shared/types';

interface NotificationState {
  /** One entry per `task.assigned` event received on the live socket. */
  notifications: TaskAssignedNotification[];
  /**
   * Whether the socket has completed its handshake. Exposed separately because
   * "connected" is not inferable from an empty notification list.
   */
  connected: boolean;
  addNotification: (notification: TaskAssignedNotification) => void;
  dismissNotification: (taskId: string) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  connected: false,
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  dismissNotification: (taskId) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.taskId !== taskId),
    })),
  setConnected: (connected) => set({ connected }),
  reset: () => set({ notifications: [], connected: false }),
}));