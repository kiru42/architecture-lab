import { Project } from '../../domain';

export interface CreateProjectCommand {
  name: string;
  description?: string;
  ownerId: string;
}

export interface ListProjectsQuery {
  ownerId: string;
}

export interface CreateProjectPort {
  execute(command: CreateProjectCommand): Promise<Project>;
}

export interface ListProjectsPort {
  execute(query: ListProjectsQuery): Promise<Project[]>;
}
