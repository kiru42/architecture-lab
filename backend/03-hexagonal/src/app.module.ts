import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Primary Adapters (HTTP)
import { AuthController } from './adapters/primary/http/auth.controller';
import { ProjectsController } from './adapters/primary/http/projects.controller';
import { TasksController } from './adapters/primary/http/tasks.controller';
import { CommentsController } from './adapters/primary/http/comments.controller';
import { JwtStrategy } from './adapters/primary/http/auth/jwt.strategy';

// Primary Adapters (WebSocket)
import { TaskEventsGateway } from './adapters/primary/websocket/task-events.gateway';

// Application Layer (Use Cases)
import { SignupUseCase } from './application/use-cases/signup.usecase';
import { SigninUseCase } from './application/use-cases/signin.usecase';
import { GetProfileUseCase } from './application/use-cases/get-profile.usecase';
import { CreateProjectUseCase } from './application/use-cases/create-project.usecase';
import { ListProjectsUseCase } from './application/use-cases/list-projects.usecase';
import { UpdateProjectUseCase } from './application/use-cases/update-project.usecase';
import { CreateTaskUseCase } from './application/use-cases/create-task.usecase';
import { ListTasksUseCase } from './application/use-cases/list-tasks.usecase';
import { UpdateTaskUseCase } from './application/use-cases/update-task.usecase';
import { CreateCommentUseCase } from './application/use-cases/create-comment.usecase';
import { ListCommentsUseCase } from './application/use-cases/list-comments.usecase';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.usecase';

// Secondary Adapters (Persistence)
import { PrismaService } from './adapters/secondary/persistence/prisma.service';
import { UserRepository } from './adapters/secondary/persistence/user.repository';
import { ProjectRepository } from './adapters/secondary/persistence/project.repository';
import { TaskRepository } from './adapters/secondary/persistence/task.repository';
import { CommentRepository } from './adapters/secondary/persistence/comment.repository';

// Domain Ports (Symbols for DI)
import { ISignupUseCase } from './domain/ports/primary/signup.usecase.interface';
import { ISigninUseCase } from './domain/ports/primary/signin.usecase.interface';
import { IGetProfileUseCase } from './domain/ports/primary/get-profile.usecase.interface';
import { ICreateProjectUseCase } from './domain/ports/primary/create-project.usecase.interface';
import { IListProjectsUseCase } from './domain/ports/primary/list-projects.usecase.interface';
import { IUpdateProjectUseCase } from './domain/ports/primary/update-project.usecase.interface';
import { ICreateTaskUseCase } from './domain/ports/primary/create-task.usecase.interface';
import { IListTasksUseCase } from './domain/ports/primary/list-tasks.usecase.interface';
import { IUpdateTaskUseCase } from './domain/ports/primary/update-task.usecase.interface';
import { ICreateCommentUseCase } from './domain/ports/primary/create-comment.usecase.interface';
import { IListCommentsUseCase } from './domain/ports/primary/list-comments.usecase.interface';
import { IDeleteCommentUseCase } from './domain/ports/primary/delete-comment.usecase.interface';
import { IUserRepository } from './domain/ports/secondary/user.repository.interface';
import { IProjectRepository } from './domain/ports/secondary/project.repository.interface';
import { ITaskRepository } from './domain/ports/secondary/task.repository.interface';
import { ICommentRepository } from './domain/ports/secondary/comment.repository.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'taskflow-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    ProjectsController,
    TasksController,
    CommentsController,
  ],
  providers: [
    // Infrastructure
    PrismaService,
    JwtStrategy,
    TaskEventsGateway,

    // Secondary Adapters (Repositories)
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IProjectRepository,
      useClass: ProjectRepository,
    },
    {
      provide: ITaskRepository,
      useClass: TaskRepository,
    },
    {
      provide: ICommentRepository,
      useClass: CommentRepository,
    },

    // Primary Ports (Use Cases)
    {
      provide: ISignupUseCase,
      useClass: SignupUseCase,
    },
    {
      provide: ISigninUseCase,
      useClass: SigninUseCase,
    },
    {
      provide: IGetProfileUseCase,
      useClass: GetProfileUseCase,
    },
    {
      provide: ICreateProjectUseCase,
      useClass: CreateProjectUseCase,
    },
    {
      provide: IListProjectsUseCase,
      useClass: ListProjectsUseCase,
    },
    {
      provide: IUpdateProjectUseCase,
      useClass: UpdateProjectUseCase,
    },
    {
      provide: ICreateTaskUseCase,
      useClass: CreateTaskUseCase,
    },
    {
      provide: IListTasksUseCase,
      useClass: ListTasksUseCase,
    },
    {
      provide: IUpdateTaskUseCase,
      useClass: UpdateTaskUseCase,
    },
    {
      provide: ICreateCommentUseCase,
      useClass: CreateCommentUseCase,
    },
    {
      provide: IListCommentsUseCase,
      useClass: ListCommentsUseCase,
    },
    {
      provide: IDeleteCommentUseCase,
      useClass: DeleteCommentUseCase,
    },
  ],
})
export class AppModule {}
