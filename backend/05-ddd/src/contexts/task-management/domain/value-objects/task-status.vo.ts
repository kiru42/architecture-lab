/**
 * Value object for a task's status.
 *
 * The frozen schema only stores \`completed\` (a boolean), so this VO is derived
 * from it: TODO means "not completed", DONE means "completed". Modelling it as a
 * VO keeps the intention-revealing name in the domain while the two-state
 * limitation stays visible right here — and nowhere else.
 */
export class TaskStatus {
  private constructor(private readonly completed: boolean) {}

  static fromCompleted(completed: boolean): TaskStatus {
    return new TaskStatus(completed);
  }

  static TODO(): TaskStatus {
    return new TaskStatus(false);
  }

  static DONE(): TaskStatus {
    return new TaskStatus(true);
  }

  isDone(): boolean {
    return this.completed;
  }

  toCompleted(): boolean {
    return this.completed;
  }

  toString(): string {
    return this.completed ? 'DONE' : 'TODO';
  }
}
