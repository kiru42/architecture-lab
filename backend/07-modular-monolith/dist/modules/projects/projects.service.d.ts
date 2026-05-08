import { ProjectsRepository } from './projects.repository';
import { Project } from '@prisma/client';
export declare class ProjectsService {
    private readonly projectsRepository;
    constructor(projectsRepository: ProjectsRepository);
    listByUser(userId: string): Promise<Project[]>;
    create(userId: string, name: string): Promise<Project>;
    update(id: string, userId: string, data: {
        name?: string;
        archived?: boolean;
    }): Promise<Project>;
    findByIdForUser(id: string, userId: string): Promise<Project>;
}
