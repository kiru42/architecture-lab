import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { io } from 'socket.io-client';
import { useNotifications } from './useNotifications';

const handlers: Record<string, (payload: unknown) => void> = {};
const disconnect = vi.fn();

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn((event: string, handler: (payload: unknown) => void) => {
      handlers[event] = handler;
    }),
    disconnect,
  })),
}));

const mockedIo = vi.mocked(io);

const notification = {
  taskId: 'task-1',
  assigneeId: 'user-b',
  assigneeName: 'Eve',
};

beforeEach(() => {
  localStorage.clear();
  disconnect.mockClear();
  mockedIo.mockClear();
  for (const key of Object.keys(handlers)) {
    delete handlers[key];
  }
});

describe('useNotifications', () => {
  it('opens no socket when there is no token', () => {
    renderHook(() => useNotifications());

    expect(mockedIo).not.toHaveBeenCalled();
  });

  it('authenticates the socket with the stored token', () => {
    localStorage.setItem('token', 'jwt-1');

    renderHook(() => useNotifications());

    expect(mockedIo).toHaveBeenCalledTimes(1);
    expect(mockedIo.mock.calls[0][1]).toMatchObject({ auth: { token: 'jwt-1' } });
  });

  it('reports the connection state', () => {
    localStorage.setItem('token', 'jwt-1');

    const { result } = renderHook(() => useNotifications());
    expect(result.current.connected).toBe(false);

    act(() => {
      handlers['connect'](undefined);
    });
    expect(result.current.connected).toBe(true);

    act(() => {
      handlers['disconnect'](undefined);
    });
    expect(result.current.connected).toBe(false);
  });

  it('collects task.assigned events', () => {
    localStorage.setItem('token', 'jwt-1');

    const { result } = renderHook(() => useNotifications());
    act(() => {
      handlers['task.assigned'](notification);
    });

    expect(result.current.notifications).toEqual([notification]);
  });

  it('dismisses a notification by task id', () => {
    localStorage.setItem('token', 'jwt-1');

    const { result } = renderHook(() => useNotifications());
    act(() => {
      handlers['task.assigned'](notification);
    });
    act(() => {
      result.current.dismiss('task-1');
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('disconnects when the component unmounts', () => {
    localStorage.setItem('token', 'jwt-1');

    const { unmount } = renderHook(() => useNotifications());
    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
