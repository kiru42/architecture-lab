import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskService } from './taskService';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('taskService', () => {
  it('getTasks scopes the request to the project and sends the bearer token', async () => {
    localStorage.setItem('token', 'jwt-1');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));

    await taskService.getTasks('project-1');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/tasks?projectId=project-1');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-1');
  });

  it('createTask POSTs the payload', async () => {
    localStorage.setItem('token', 'jwt-1');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ id: 'task-1' }));

    await taskService.createTask('Write tests', 'the boring part', 'project-1');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/tasks');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      title: 'Write tests',
      description: 'the boring part',
      projectId: 'project-1',
    });
  });

  it('deleteTask fails loudly when the API rejects the request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'nope' }, false, 404));

    await expect(taskService.deleteTask('task-1')).rejects.toThrow('Failed to delete task');
  });
});
