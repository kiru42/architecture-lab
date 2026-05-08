import { PrismaService } from '../../shared/prisma/prisma.service';
import { Task } from '@prisma/client';
export declare class TasksRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Task | null>;
    findByProjectId(projectId: string): Promise<Task[]>;
    create(data: {
        title: string;
        description?: string;
        dueDate?: Date;
        assigneeId?: string;
        projectId: string;
    }): Promise<Task>;
    update(id: string, data: {
        title?: string;
        description?: string;
        completed?: boolean;
        dueDate?: Date;
        assigneeId?: string;
    }): Promise<Task>;
}
