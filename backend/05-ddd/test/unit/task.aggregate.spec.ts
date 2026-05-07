import { Task } from '../../src/contexts/task-management/domain/aggregates/task.aggregate';
import { TaskId } from '../../src/contexts/task-management/domain/value-objects/task-id.vo';

describe('Task Aggregate', () => {
  it('should create a task with TODO status', () => {
    const id = TaskId.generate();
    const task = Task.create(id, 'Write tests', 'Unit tests for DDD', 'proj-1');

    expect(task.getTitle()).toBe('Write tests');
    expect(task.getStatus().getValue()).toBe('TODO');
  });

  it('should complete a task and emit TaskCompletedEvent', () => {
    const id = TaskId.generate();
    const task = Task.create(id, 'Implement feature', null, 'proj-1');

    task.complete();

    expect(task.getStatus().getValue()).toBe('DONE');
    expect(task.getDomainEvents()).toHaveLength(1);
    expect(task.getDomainEvents()[0].eventName).toBe('TaskCompleted');
  });

  it('should not emit event if already completed', () => {
    const id = TaskId.generate();
    const task = Task.create(id, 'Implement feature', null, 'proj-1');
    task.complete();
    task.clearDomainEvents();

    task.complete();

    expect(task.getDomainEvents()).toHaveLength(0);
  });
});
