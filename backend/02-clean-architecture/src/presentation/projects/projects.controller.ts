import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import {
  CreateProjectUseCase,
  ListProjectsUseCase,
  UpdateProjectUseCase,
} from '../../core/application';
import { UpdateProjectDto } from '../../core/application/dtos/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: CurrentUserData) {
    return this.listProjectsUseCase.execute(user.userId);
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserData, @Body() body: { name: string }) {
    return this.createProjectUseCase.execute({ name: body.name, userId: user.userId });
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
  ) {
    return this.updateProjectUseCase.execute(id, user.userId, body);
  }
}
