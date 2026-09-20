import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskService } from './taskService';
import type { Task } from '../types';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

const task: Task = {
  id: 'task-1',
  title: 'Write tests',
  description: 'the boring part',
  completed: false,
  dueDate: null,
  projectId: 'project-1',
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('taskService', () => {
  it('getTasks reads the collection under its project and sends the bearer token', async () => {
    localStorage.setItem('token', 'jwt-1');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([task]));

    const tasks = await taskService.getTasks('project-1');

    const [url, init] = fetchMock.mock.calls[0];
    // Tasks live under their project in the contract; there is no /tasks?projectId.
    expect(url).toBe('/api/projects/project-1/tasks');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-1');
    // And the payload is the bare array, not a `{ tasks }` envelope.
    expect(tasks).toEqual([task]);
  });

  it('createTask POSTs to the project and keeps projectId out of the body', async () => {
    localStorage.setItem('token', 'jwt-1');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(task));

    const created = await taskService.createTask('Write tests', 'the boring part', 'project-1');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/projects/project-1/tasks');
    expect(init?.method).toBe('POST');
    // The path parameter is the parent; the backend rejects unknown body fields.
    expect(JSON.parse(String(init?.body))).toEqual({
      title: 'Write tests',
      description: 'the boring part',
    });
    expect(created).toEqual(task);
  });

  it('updateTask PATCHes the task and returns the bare resource', async () => {
    localStorage.setItem('token', 'jwt-1');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ ...task, completed: true }));

    const updated = await taskService.updateTask('task-1', { completed: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/tasks/task-1');
    expect(init?.method).toBe('PATCH');
    expect(updated.completed).toBe(true);
  });

  it('offers no deleteTask, because the contract has no DELETE /tasks/{id}', () => {
    expect('deleteTask' in taskService).toBe(false);
  });
});
