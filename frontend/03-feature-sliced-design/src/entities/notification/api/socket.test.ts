import { beforeEach, describe, expect, it, vi } from 'vitest';
import { io } from 'socket.io-client';
import { openNotificationSocket } from './socket';

const handlers: Record<string, (payload?: unknown) => void> = {};
const disconnect = vi.fn();

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      handlers[event] = handler;
    }),
    disconnect,
  })),
}));

const mockedIo = vi.mocked(io);

beforeEach(() => {
  // The socket URL comes from the browser at connect time; the test environment
  // is `node`, so only `window` has to be provided.
  (globalThis as unknown as { window: unknown }).window = {
    location: { origin: 'http://localhost:5199' },
  };
  mockedIo.mockClear();
  disconnect.mockClear();
  for (const key of Object.keys(handlers)) {
    delete handlers[key];
  }
});

describe('openNotificationSocket', () => {
  it('carries the token in the handshake, never in the URL', () => {
    openNotificationSocket('jwt-1', vi.fn());

    const [url, options] = mockedIo.mock.calls[0];
    expect(options).toMatchObject({ auth: { token: 'jwt-1' } });
    expect(String(url)).not.toContain('jwt-1');
  });

  it('forwards task.assigned events and stops on disconnect', () => {
    const onNotification = vi.fn();
    const socket = openNotificationSocket('jwt-1', onNotification);
    const payload = { taskId: 'task-1', assigneeId: 'user-b', assigneeName: 'Eve' };

    handlers['task.assigned'](payload);
    expect(onNotification).toHaveBeenCalledWith(payload);

    socket.disconnect();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
