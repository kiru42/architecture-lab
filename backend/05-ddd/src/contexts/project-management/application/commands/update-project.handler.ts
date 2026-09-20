import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateProjectCommand } from './update-project.command';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../domain/repositories/project.repository';
import { Project } from '../../domain/aggregates/project.aggregate';
import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectName } from '../../domain/value-objects/project-name.vo';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand> {
  constructor(
    @Inject(IProjectRepositoryToken) private readonly repo: IProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateProjectCommand): Promise<Project> {
    const project = await this.repo.findById(ProjectId.create(command.projectId));
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    if (command.changes.name !== undefined) {
      project.rename(ProjectName.create(command.changes.name));
    }
    if (command.changes.archived !== undefined) {
      command.changes.archived ? project.archive() : project.unarchive();
    }

    await this.repo.save(project);
    project.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    project.clearDomainEvents();
    return project;
  }
}
