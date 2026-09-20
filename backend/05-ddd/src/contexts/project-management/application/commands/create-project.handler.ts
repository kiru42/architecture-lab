import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProjectCommand } from './create-project.command';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../domain/repositories/project.repository';
import { Project } from '../../domain/aggregates/project.aggregate';
import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectName } from '../../domain/value-objects/project-name.vo';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject(IProjectRepositoryToken) private readonly repo: IProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const project = Project.create(
      ProjectId.generate(),
      ProjectName.create(command.name),
      command.userId,
    );

    await this.repo.save(project);
    this.publishAndClear(project);
    return project;
  }

  private publishAndClear(project: Project): void {
    project.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    project.clearDomainEvents();
  }
}
