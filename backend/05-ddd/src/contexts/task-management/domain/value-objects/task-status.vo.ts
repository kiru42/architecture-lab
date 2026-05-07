export enum TaskStatusEnum { TODO = 'TODO', IN_PROGRESS = 'IN_PROGRESS', DONE = 'DONE' }
export class TaskStatus {
  private constructor(private readonly value: TaskStatusEnum) {}
  static create(value: string): TaskStatus {
    if (!Object.values(TaskStatusEnum).includes(value as TaskStatusEnum)) throw new Error('Invalid status');
    return new TaskStatus(value as TaskStatusEnum);
  }
  static TODO(): TaskStatus { return new TaskStatus(TaskStatusEnum.TODO); }
  getValue(): TaskStatusEnum { return this.value; }
  isDone(): boolean { return this.value === TaskStatusEnum.DONE; }
}
