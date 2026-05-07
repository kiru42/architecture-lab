import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateProjectCommand } from './create-project.command';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/aggregates/project.aggregate';
import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectName } from '../../domain/value-objects/project-name.vo';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject('IProjectRepository') private readonly repo: IProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: CreateProjectCommand): Promise<string> {
    const projectId = ProjectId.generate();
    const name = ProjectName.create(cmd.name);
    const project = Project.create(projectId, name, cmd.description, cmd.ownerId);
    await this.repo.save(project);
    project.getDomainEvents().forEach((e) => this.eventBus.publish(e));
    project.clearDomainEvents();
    return projectId.getValue();
  }
}
