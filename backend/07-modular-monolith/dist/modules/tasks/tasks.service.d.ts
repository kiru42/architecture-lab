import { TasksRepository } from './tasks.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Task } from '@prisma/client';
export declare class TasksService {
    private readonly tasksRepository;
    private readonly prisma;
    constructor(tasksRepository: TasksRepository, prisma: PrismaService);
    private assertProjectAccess;
    listByProject(projectId: string, userId: string): Promise<Task[]>;
    create(projectId: string, userId: string, data: {
        title: string;
        description?: string;
        dueDate?: string;
        assigneeId?: string;
    }): Promise<Task>;
    update(id: string, userId: string, data: {
        title?: string;
        description?: string;
        completed?: boolean;
        dueDate?: string;
        assigneeId?: string;
    }): Promise<Task>;
}
