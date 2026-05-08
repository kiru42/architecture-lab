import { CommentsRepository } from './comments.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Comment } from '@prisma/client';
export declare class CommentsService {
    private readonly commentsRepository;
    private readonly prisma;
    constructor(commentsRepository: CommentsRepository, prisma: PrismaService);
    private assertTaskAccess;
    listByTask(taskId: string, userId: string): Promise<Comment[]>;
    create(taskId: string, userId: string, content: string): Promise<Comment>;
    delete(id: string, userId: string): Promise<void>;
}
