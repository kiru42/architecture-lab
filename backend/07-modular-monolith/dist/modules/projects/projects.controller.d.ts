import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    list(user: {
        id: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        archived: boolean;
        userId: string;
    }[]>;
    create(user: {
        id: string;
    }, dto: CreateProjectDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        archived: boolean;
        userId: string;
    }>;
    update(id: string, user: {
        id: string;
    }, dto: UpdateProjectDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        archived: boolean;
        userId: string;
    }>;
}
