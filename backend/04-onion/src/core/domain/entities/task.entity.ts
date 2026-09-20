/**
 * Onion layer: Domain (the centre).
 *
 * \`completed\` is a boolean in the frozen schema, so the domain derives its
 * two-state status from it rather than the other way round. All mutators return
 * a new Task — entities here are treated as immutable value-ish objects.
 */
export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly completed: boolean,
    public readonly dueDate: Date | null,
    public readonly projectId: string,
    public readonly assigneeId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    title: string,
    projectId: string,
    options: {
      description?: string | null;
      dueDate?: Date | null;
      assigneeId?: string | null;
    } = {},
    now = new Date(),
  ): Task {
    return new Task(
      '',
      title,
      options.description ?? null,
      false,
      options.dueDate ?? null,
      projectId,
      options.assigneeId ?? null,
      now,
      now,
    );
  }

  belongsToProject(projectId: string): boolean {
    return this.projectId === projectId;
  }

  isAssignedTo(userId: string): boolean {
    return this.assigneeId === userId;
  }

  rename(title: string): Task {
    return this.with({ title });
  }

  describe(description: string | null): Task {
    return this.with({ description });
  }

  reschedule(dueDate: Date | null): Task {
    return this.with({ dueDate });
  }

  markCompleted(): Task {
    return this.with({ completed: true });
  }

  markIncomplete(): Task {
    return this.with({ completed: false });
  }

  assignTo(userId: string): Task {
    if (this.isAssignedTo(userId)) {
      throw new Error('Task is already assigned to this user');
    }
    return this.with({ assigneeId: userId });
  }

  reassign(assigneeId: string | null): Task {
    return assigneeId === null ? this.unassign() : this.assignTo(assigneeId);
  }

  unassign(): Task {
    return this.with({ assigneeId: null });
  }

  private with(changes: Partial<Omit<Task, 'id' | 'projectId' | 'createdAt'>>): Task {
    return new Task(
      this.id,
      changes.title ?? this.title,
      changes.description !== undefined ? changes.description : this.description,
      changes.completed ?? this.completed,
      changes.dueDate !== undefined ? changes.dueDate : this.dueDate,
      this.projectId,
      changes.assigneeId !== undefined ? changes.assigneeId : this.assigneeId,
      this.createdAt,
      new Date(),
    );
  }
}
