import { PrismaService } from '../../shared/prisma/prisma.service';
import { Comment } from '@prisma/client';
export declare class CommentsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Comment | null>;
    findByTaskId(taskId: string): Promise<Comment[]>;
    create(data: {
        content: string;
        taskId: string;
        authorId: string;
    }): Promise<Comment>;
    delete(id: string): Promise<void>;
}
