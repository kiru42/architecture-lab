import { Task } from '../../src/contexts/task-management/domain/aggregates/task.aggregate';
import { TaskId } from '../../src/contexts/task-management/domain/value-objects/task-id.vo';

describe('Task aggregate', () => {
  const build = (title = 'Write tests') =>
    Task.create(TaskId.generate(), title, 'proj-1', { description: 'Unit tests for DDD' });

  it('creates a task that is TODO and unassigned', () => {
    const task = build();

    expect(task.getTitle()).toBe('Write tests');
    expect(task.getDescription()).toBe('Unit tests for DDD');
    expect(task.getStatus().isDone()).toBe(false);
    expect(task.getStatus().toString()).toBe('TODO');
    expect(task.isCompleted()).toBe(false);
    expect(task.getAssigneeId()).toBeNull();
  });

  it('completes a task and emits TaskCompletedEvent', () => {
    const task = build();

    task.complete();

    expect(task.isCompleted()).toBe(true);
    expect(task.getStatus().toString()).toBe('DONE');
    expect(task.getDomainEvents().map((e) => e.eventName)).toEqual(['TaskCompleted']);
  });

  it('stays idempotent when completing twice', () => {
    const task = build();
    task.complete();
    task.clearDomainEvents();

    task.complete();

    expect(task.getDomainEvents()).toHaveLength(0);
  });

  it('reopens a completed task', () => {
    const task = build();
    task.complete();
    task.clearDomainEvents();

    task.reopen();

    expect(task.isCompleted()).toBe(false);
    expect(task.getDomainEvents()).toHaveLength(0);
  });

  it('emits TaskAssignedEvent when the assignee changes', () => {
    const task = build();

    task.assignTo('user-2');

    expect(task.getAssigneeId()).toBe('user-2');
    expect(task.getDomainEvents().map((e) => e.eventName)).toEqual(['TaskAssigned']);
  });

  it('does not emit an event when assigning to the current assignee', () => {
    const task = build();
    task.assignTo('user-2');
    task.clearDomainEvents();

    task.assignTo('user-2');

    expect(task.getDomainEvents()).toHaveLength(0);
  });

  it('unassigns', () => {
    const task = build();
    task.assignTo('user-2');

    task.unassign();

    expect(task.getAssigneeId()).toBeNull();
  });
});
