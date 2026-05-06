import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import {
  ICreateProjectUseCase,
  ICreateProjectUseCase as ICreateProjectUseCaseToken,
} from '@domain/ports/primary/create-project.usecase.interface';
import {
  IListProjectsUseCase,
  IListProjectsUseCase as IListProjectsUseCaseToken,
} from '@domain/ports/primary/list-projects.usecase.interface';
import {
  IUpdateProjectUseCase,
  IUpdateProjectUseCase as IUpdateProjectUseCaseToken,
} from '@domain/ports/primary/update-project.usecase.interface';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    @Inject(ICreateProjectUseCaseToken)
    private readonly createProjectUseCase: ICreateProjectUseCase,
    @Inject(IListProjectsUseCaseToken)
    private readonly listProjectsUseCase: IListProjectsUseCase,
    @Inject(IUpdateProjectUseCaseToken)
    private readonly updateProjectUseCase: IUpdateProjectUseCase,
  ) {}

  @Get()
  async list(@Request() req) {
    return await this.listProjectsUseCase.execute(req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateProjectDto) {
    return await this.createProjectUseCase.execute(dto.name, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.updateProjectUseCase.execute(id, req.user.userId, dto);
  }
}
