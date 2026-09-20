import { beforeEach, describe, expect, it, vi } from 'vitest';
import { io } from 'socket.io-client';
import { SocketIoNotificationSocket } from './SocketIoNotificationSocket';

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
  // The adapter resolves the socket URL at connect time from the browser; the
  // test environment is `node`, so the only thing missing is a `window`.
  (globalThis as unknown as { window: unknown }).window = {
    location: { origin: 'http://localhost:5199' },
  };
  mockedIo.mockClear();
  disconnect.mockClear();
  for (const key of Object.keys(handlers)) {
    delete handlers[key];
  }
});

describe('SocketIoNotificationSocket', () => {
  it('carries the token in the handshake, never in the URL', () => {
    new SocketIoNotificationSocket().connect('jwt-1', vi.fn());

    const [url, options] = mockedIo.mock.calls[0];
    expect(options).toMatchObject({ auth: { token: 'jwt-1' } });
    expect(String(url)).not.toContain('jwt-1');
  });

  it('forwards task.assigned events', () => {
    const onNotification = vi.fn();
    new SocketIoNotificationSocket().connect('jwt-1', onNotification);
    const payload = { taskId: 'task-1', assigneeId: 'user-b', assigneeName: 'Eve' };

    handlers['task.assigned'](payload);

    expect(onNotification).toHaveBeenCalledWith(payload);
  });

  it('exposes the connection lifecycle and closing it', () => {
    const connection = new SocketIoNotificationSocket().connect('jwt-1', vi.fn());
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    connection.onConnect(onConnect);
    connection.onDisconnect(onDisconnect);

    expect(handlers['connect']).toBeDefined();
    expect(handlers['disconnect']).toBeDefined();

    connection.disconnect();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
