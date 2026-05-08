import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    list(taskId: string, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        taskId: string;
        authorId: string;
    }[]>;
    create(taskId: string, user: {
        id: string;
    }, dto: CreateCommentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        taskId: string;
        authorId: string;
    }>;
    delete(id: string, user: {
        id: string;
    }): Promise<void>;
}
