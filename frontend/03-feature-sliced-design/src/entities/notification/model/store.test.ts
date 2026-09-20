import { beforeEach, describe, expect, it } from 'vitest';
import { useNotificationStore } from './store';

const notification = {
  taskId: 'task-1',
  assigneeId: 'user-b',
  assigneeName: 'Eve',
};

beforeEach(() => {
  useNotificationStore.getState().reset();
});

describe('notification store', () => {
  it('starts empty and disconnected', () => {
    const state = useNotificationStore.getState();

    expect(state.notifications).toEqual([]);
    expect(state.connected).toBe(false);
  });

  it('collects one entry per task.assigned event', () => {
    useNotificationStore.getState().addNotification(notification);

    expect(useNotificationStore.getState().notifications).toEqual([notification]);
  });

  it('dismisses by task id, leaving the others alone', () => {
    const store = useNotificationStore.getState();
    store.addNotification(notification);
    store.addNotification({ ...notification, taskId: 'task-2' });

    useNotificationStore.getState().dismissNotification('task-1');

    expect(useNotificationStore.getState().notifications).toEqual([
      { ...notification, taskId: 'task-2' },
    ]);
  });

  it('tracks the socket connection separately from the list', () => {
    useNotificationStore.getState().setConnected(true);

    const state = useNotificationStore.getState();
    // Connected with nothing to show is a different state from not connected.
    expect(state.connected).toBe(true);
    expect(state.notifications).toEqual([]);
  });
});
