import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { ICreateProjectUseCase } from '../../../../domain/ports/primary/create-project.usecase.interface';
import { IListProjectsUseCase } from '../../../../domain/ports/primary/list-projects.usecase.interface';
import { IUpdateProjectUseCase } from '../../../../domain/ports/primary/update-project.usecase.interface';
import { JwtAuthGuard } from '../../../out/auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    @Inject(ICreateProjectUseCase) private readonly createProject: ICreateProjectUseCase,
    @Inject(IListProjectsUseCase) private readonly listProjects: IListProjectsUseCase,
    @Inject(IUpdateProjectUseCase) private readonly updateProject: IUpdateProjectUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser('userId') userId: string) {
    return this.createProject.execute(dto.name, userId);
  }

  @Get()
  async list(@CurrentUser('userId') userId: string) {
    return this.listProjects.execute(userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.updateProject.execute(id, userId, dto);
  }
}
