import { beforeEach, describe, expect, it, vi } from 'vitest';
import { io } from 'socket.io-client';
import { notificationService } from './notificationService';

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

describe('notificationService', () => {
  it('carries the token in the handshake, never in the URL', () => {
    notificationService.connect('jwt-1', vi.fn());

    const [url, options] = mockedIo.mock.calls[0];
    expect(options).toMatchObject({ auth: { token: 'jwt-1' } });
    expect(String(url)).not.toContain('jwt-1');
  });

  it('forwards task.assigned events to the caller', () => {
    const onNotification = vi.fn();
    notificationService.connect('jwt-1', onNotification);
    const payload = { taskId: 'task-1', assigneeId: 'user-b', assigneeName: 'Eve' };

    handlers['task.assigned'](payload);

    expect(onNotification).toHaveBeenCalledWith(payload);
  });

  it('hands the socket back so the caller can close it', () => {
    const socket = notificationService.connect('jwt-1', vi.fn());

    socket.disconnect();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
