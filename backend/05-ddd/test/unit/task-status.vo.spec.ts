import { TaskStatus } from '../../src/contexts/task-management/domain/value-objects/task-status.vo';

describe('TaskStatus value object', () => {
  it('derives its state from the boolean the frozen schema stores', () => {
    expect(TaskStatus.fromCompleted(false).toString()).toBe('TODO');
    expect(TaskStatus.fromCompleted(true).toString()).toBe('DONE');
  });

  it('round-trips back to the boolean', () => {
    expect(TaskStatus.TODO().toCompleted()).toBe(false);
    expect(TaskStatus.DONE().toCompleted()).toBe(true);
  });

  it('reports doneness', () => {
    expect(TaskStatus.TODO().isDone()).toBe(false);
    expect(TaskStatus.DONE().isDone()).toBe(true);
  });
});
