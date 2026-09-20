import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  ProjectArchivedEvent,
  ProjectCreatedEvent,
  ProjectRenamedEvent,
  ProjectUnarchivedEvent,
} from '../../shared/events/project.events';
import { InMemoryProjectReadRepository } from '../../infrastructure/read-models/in-memory-project-read-repository';
import { ProjectReadModel } from '../projections/project-read-model';

/** Keeps the project read model in sync with the event stream. */
@EventsHandler(
  ProjectCreatedEvent,
  ProjectRenamedEvent,
  ProjectArchivedEvent,
  ProjectUnarchivedEvent,
)
export class ProjectProjection
  implements
    IEventHandler<
      | ProjectCreatedEvent
      | ProjectRenamedEvent
      | ProjectArchivedEvent
      | ProjectUnarchivedEvent
    >
{
  constructor(private readonly readRepo: InMemoryProjectReadRepository) {}

  handle(
    event:
      | ProjectCreatedEvent
      | ProjectRenamedEvent
      | ProjectArchivedEvent
      | ProjectUnarchivedEvent,
  ): void {
    if (event instanceof ProjectCreatedEvent) {
      this.readRepo.save(
        new ProjectReadModel(
          event.aggregateId,
          event.data.name,
          false,
          event.data.userId,
          event.timestamp,
          event.timestamp,
        ),
      );
      return;
    }

    const current = this.readRepo.findById(event.aggregateId);
    if (!current) return;

    if (event instanceof ProjectRenamedEvent) {
      this.readRepo.save(
        new ProjectReadModel(
          current.id,
          event.data.name,
          current.archived,
          current.userId,
          current.createdAt,
          event.timestamp,
        ),
      );
    } else if (event instanceof ProjectArchivedEvent) {
      this.readRepo.save(
        new ProjectReadModel(
          current.id,
          current.name,
          true,
          current.userId,
          current.createdAt,
          event.timestamp,
        ),
      );
    } else {
      this.readRepo.save(
        new ProjectReadModel(
          current.id,
          current.name,
          false,
          current.userId,
          current.createdAt,
          event.timestamp,
        ),
      );
    }
  }
}
