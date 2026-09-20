import { Task } from '../src/core/domain/entities/task.entity';

describe('Task (domain entity)', () => {
  it('creates a task that is not completed and unassigned', () => {
    const task = Task.create('Test Task', 'proj-1');

    expect(task.title).toBe('Test Task');
    expect(task.projectId).toBe('proj-1');
    expect(task.completed).toBe(false);
    expect(task.assigneeId).toBeNull();
    expect(task.description).toBeNull();
    expect(task.dueDate).toBeNull();
  });

  it('carries the optional fields given at creation', () => {
    const dueDate = new Date('2030-01-01T00:00:00Z');
    const task = Task.create('Test Task', 'proj-1', {
      description: 'Desc',
      dueDate,
      assigneeId: 'user-2',
    });

    expect(task.description).toBe('Desc');
    expect(task.dueDate).toBe(dueDate);
    expect(task.assigneeId).toBe('user-2');
  });

  it('marks itself completed and incomplete', () => {
    const task = Task.create('Task', 'proj-1');

    expect(task.markCompleted().completed).toBe(true);
    expect(task.markCompleted().markIncomplete().completed).toBe(false);
  });

  it('assigns to a user', () => {
    const task = Task.create('Task', 'proj-1');

    expect(task.assignTo('user-2').assigneeId).toBe('user-2');
  });

  it('throws when assigning to the same user twice', () => {
    const assigned = Task.create('Task', 'proj-1').assignTo('user-2');

    expect(() => assigned.assignTo('user-2')).toThrow('Task is already assigned to this user');
  });

  it('unassigns', () => {
    const assigned = Task.create('Task', 'proj-1').assignTo('user-2');

    expect(assigned.unassign().assigneeId).toBeNull();
    expect(assigned.reassign(null).assigneeId).toBeNull();
  });

  it('checks project membership', () => {
    const task = Task.create('Task', 'proj-1');

    expect(task.belongsToProject('proj-1')).toBe(true);
    expect(task.belongsToProject('proj-2')).toBe(false);
  });

  it('never mutates the instance it was called on', () => {
    const task = Task.create('Task', 'proj-1');

    task.markCompleted();
    task.assignTo('user-2');
    task.rename('Other');

    expect(task.completed).toBe(false);
    expect(task.assigneeId).toBeNull();
    expect(task.title).toBe('Task');
  });
});
