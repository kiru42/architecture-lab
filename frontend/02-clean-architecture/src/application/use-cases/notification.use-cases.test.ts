import { describe, expect, it, vi } from 'vitest';
import { WatchTaskAssignmentsUseCase } from './notification.use-cases';
import type { INotificationSocket, NotificationConnection } from '@domain/ports';
import type { TaskAssignedNotification } from '@domain/entities';

const notification: TaskAssignedNotification = {
  taskId: 'task-1',
  assigneeId: 'user-b',
  assigneeName: 'Eve',
};

function fakeSocket() {
  let onNotification: (n: TaskAssignedNotification) => void = () => {};
  const connection: NotificationConnection = {
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    disconnect: vi.fn(),
  };
  const port: INotificationSocket = {
    connect: vi.fn((_token, handler) => {
      onNotification = handler;
      return connection;
    }),
  };
  return { port, connection, emit: (n: TaskAssignedNotification) => onNotification(n) };
}

describe('WatchTaskAssignmentsUseCase', () => {
  it('opens no connection without a token', () => {
    const { port } = fakeSocket();
    const subscription = new WatchTaskAssignmentsUseCase(port).execute({
      token: null,
      onNotification: vi.fn(),
      onConnectedChange: vi.fn(),
    });

    expect(subscription).toBeNull();
    expect(port.connect).not.toHaveBeenCalled();
  });

  it('authenticates with the token it was given', () => {
    const { port } = fakeSocket();
    new WatchTaskAssignmentsUseCase(port).execute({
      token: 'jwt-1',
      onNotification: vi.fn(),
      onConnectedChange: vi.fn(),
    });

    expect(port.connect).toHaveBeenCalledWith('jwt-1', expect.any(Function));
  });

  it('forwards task.assigned events to the caller', () => {
    const { port, emit } = fakeSocket();
    const onNotification = vi.fn();
    new WatchTaskAssignmentsUseCase(port).execute({
      token: 'jwt-1',
      onNotification,
      onConnectedChange: vi.fn(),
    });

    emit(notification);

    expect(onNotification).toHaveBeenCalledWith(notification);
  });

  it('disconnects when the subscription is closed', () => {
    const { port, connection } = fakeSocket();
    const subscription = new WatchTaskAssignmentsUseCase(port).execute({
      token: 'jwt-1',
      onNotification: vi.fn(),
      onConnectedChange: vi.fn(),
    });

    subscription?.disconnect();

    expect(connection.disconnect).toHaveBeenCalledTimes(1);
  });
});
