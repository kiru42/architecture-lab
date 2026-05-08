import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    list(projectId: string, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        completed: boolean;
        dueDate: Date | null;
        projectId: string;
        assigneeId: string | null;
    }[]>;
    create(projectId: string, user: {
        id: string;
    }, dto: CreateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        completed: boolean;
        dueDate: Date | null;
        projectId: string;
        assigneeId: string | null;
    }>;
    update(id: string, user: {
        id: string;
    }, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        completed: boolean;
        dueDate: Date | null;
        projectId: string;
        assigneeId: string | null;
    }>;
}
