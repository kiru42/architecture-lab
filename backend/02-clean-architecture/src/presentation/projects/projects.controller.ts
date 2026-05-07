import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import { CreateProjectUseCase, ListProjectsUseCase } from '../../core/application';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: CurrentUserData) {
    return this.listProjectsUseCase.execute(user.userId);
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { name: string },
  ) {
    return this.createProjectUseCase.execute({
      name: body.name,
      userId: user.userId,
    });
  }
}
