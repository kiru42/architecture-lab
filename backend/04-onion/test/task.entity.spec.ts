import { Task, TaskStatus, TaskPriority } from '../src/core/domain/entities/task.entity';

describe('Task Entity', () => {
  it('should create a task', () => {
    const task = Task.create('1', 'Test Task', 'Desc', TaskPriority.HIGH, 'proj-1', 'user-1', null);

    expect(task.id).toBe('1');
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.assignedToId).toBeNull();
  });

  it('should assign task to user', () => {
    const task = Task.create('1', 'Task', null, TaskPriority.MEDIUM, 'proj-1', 'user-1', null);
    const assigned = task.assignTo('user-2');

    expect(assigned.assignedToId).toBe('user-2');
  });

  it('should throw when assigning to same user', () => {
    const task = Task.create('1', 'Task', null, TaskPriority.MEDIUM, 'proj-1', 'user-1', null);
    const assigned = task.assignTo('user-2');

    expect(() => assigned.assignTo('user-2')).toThrow('Task already assigned to this user');
  });

  it('should update task status', () => {
    const task = Task.create('1', 'Task', null, TaskPriority.LOW, 'proj-1', 'user-1', null);
    const updated = task.updateStatus(TaskStatus.IN_PROGRESS);

    expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should throw when updating to same status', () => {
    const task = Task.create('1', 'Task', null, TaskPriority.LOW, 'proj-1', 'user-1', null);

    expect(() => task.updateStatus(TaskStatus.TODO)).toThrow('Task already in this status');
  });
});
