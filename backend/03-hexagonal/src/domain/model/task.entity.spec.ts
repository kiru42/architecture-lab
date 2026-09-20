import { Task } from './task.entity';

const newTask = () =>
  new Task({
    id: 't1',
    title: 'Write tests',
    description: null,
    completed: false,
    dueDate: null,
    projectId: 'p1',
    assigneeId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('Task', () => {
  it('starts out open and unassigned', () => {
    const task = newTask();

    expect(task.completed).toBe(false);
    expect(task.assigneeId).toBeNull();
  });

  it('can be marked completed and back to open', () => {
    const task = newTask();

    task.markCompleted();
    expect(task.completed).toBe(true);

    task.markIncomplete();
    expect(task.completed).toBe(false);
  });

  it('can be assigned and unassigned', () => {
    const task = newTask();

    task.assignTo('u2');
    expect(task.assigneeId).toBe('u2');

    task.unassign();
    expect(task.assigneeId).toBeNull();
  });
});
