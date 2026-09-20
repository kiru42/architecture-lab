import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  TaskAssignedEvent,
  TaskCompletedEvent,
  TaskCreatedEvent,
  TaskReopenedEvent,
  TaskUpdatedEvent,
} from '../../shared/events/task.events';
import { InMemoryTaskReadRepository } from '../../infrastructure/read-models/in-memory-task-read-repository';
import { TaskReadModel } from '../projections/task-read-model';

/** Keeps the task read model in sync with the event stream. */
@EventsHandler(
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskCompletedEvent,
  TaskReopenedEvent,
  TaskAssignedEvent,
)
export class TaskProjection
  implements
    IEventHandler<
      TaskCreatedEvent | TaskUpdatedEvent | TaskCompletedEvent | TaskReopenedEvent | TaskAssignedEvent
    >
{
  constructor(private readonly readRepo: InMemoryTaskReadRepository) {}

  handle(
    event:
      | TaskCreatedEvent
      | TaskUpdatedEvent
      | TaskCompletedEvent
      | TaskReopenedEvent
      | TaskAssignedEvent,
  ): void {
    if (event instanceof TaskCreatedEvent) {
      this.readRepo.save(
        new TaskReadModel(
          event.aggregateId,
          event.data.title,
          event.data.description,
          false,
          event.data.dueDate,
          event.data.projectId,
          event.data.assigneeId,
          event.timestamp,
          event.timestamp,
        ),
      );
      return;
    }

    const current = this.readRepo.findById(event.aggregateId);
    if (!current) return;

    const next = new TaskReadModel(
      current.id,
      current.title,
      current.description,
      current.completed,
      current.dueDate,
      current.projectId,
      current.assigneeId,
      current.createdAt,
      event.timestamp,
    );

    if (event instanceof TaskUpdatedEvent) {
      if (event.data.title !== undefined) next.title = event.data.title;
      if (event.data.description !== undefined) next.description = event.data.description;
      if (event.data.dueDate !== undefined) next.dueDate = event.data.dueDate;
    } else if (event instanceof TaskCompletedEvent) {
      next.completed = true;
    } else if (event instanceof TaskReopenedEvent) {
      next.completed = false;
    } else {
      next.assigneeId = event.data.assigneeId;
    }

    this.readRepo.save(next);
  }
}
