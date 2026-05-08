import { PrismaService } from '../../shared/prisma/prisma.service';
import { Project } from '@prisma/client';
export declare class ProjectsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Project | null>;
    findByUserId(userId: string): Promise<Project[]>;
    create(data: {
        name: string;
        userId: string;
    }): Promise<Project>;
    update(id: string, data: {
        name?: string;
        archived?: boolean;
    }): Promise<Project>;
}
