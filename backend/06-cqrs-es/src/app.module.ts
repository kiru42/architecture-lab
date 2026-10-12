import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Event store
import { InMemoryEventStore } from './infrastructure/event-store/in-memory-event-store';
import { EventReplayer } from './infrastructure/event-store/event-replayer';

// Read models
import { InMemoryUserReadRepository } from './infrastructure/read-models/in-memory-user-read-repository';
import { InMemoryProjectReadRepository } from './infrastructure/read-models/in-memory-project-read-repository';
import { InMemoryTaskReadRepository } from './infrastructure/read-models/in-memory-task-read-repository';
import { InMemoryCommentReadRepository } from './infrastructure/read-models/in-memory-comment-read-repository';

// Write side
import { SignupHandler } from './write-side/command-handlers/signup.handler';
import { SigninHandler } from './write-side/command-handlers/signin.handler';
import { CreateProjectHandler } from './write-side/command-handlers/create-project.handler';
import { UpdateProjectHandler } from './write-side/command-handlers/update-project.handler';
import { CreateTaskHandler } from './write-side/command-handlers/create-task.handler';
import { UpdateTaskHandler } from './write-side/command-handlers/update-task.handler';
import { AddCommentHandler } from './write-side/command-handlers/add-comment.handler';
import { DeleteCommentHandler } from './write-side/command-handlers/delete-comment.handler';

// Projections
import { UserRegisteredHandler } from './read-side/event-handlers/user-registered.handler';
import { ProjectProjection } from './read-side/event-handlers/project-projection';
import { TaskProjection } from './read-side/event-handlers/task-projection';
import { CommentProjection } from './read-side/event-handlers/comment-projection';

// Read side queries
import { GetUsersHandler } from './read-side/query-handlers/get-users.handler';
import { GetProfileHandler } from './read-side/query-handlers/get-profile.handler';
import { GetProjectsHandler } from './read-side/query-handlers/get-projects.handler';
import { GetTasksHandler } from './read-side/query-handlers/get-tasks.handler';
import { GetTaskHandler } from './read-side/query-handlers/get-task.handler';
import { GetCommentsHandler } from './read-side/query-handlers/get-comments.handler';

// HTTP
import { AuthController } from './infrastructure/http/auth.controller';
import { ProjectsController } from './infrastructure/http/projects.controller';
import { TasksController } from './infrastructure/http/tasks.controller';
import { CommentsController } from './infrastructure/http/comments.controller';
import { JwtStrategy } from './infrastructure/http/jwt.strategy';

const CommandHandlers = [
  SignupHandler,
  SigninHandler,
  CreateProjectHandler,
  UpdateProjectHandler,
  CreateTaskHandler,
  UpdateTaskHandler,
  AddCommentHandler,
  DeleteCommentHandler,
];

const QueryHandlers = [
  GetUsersHandler,
  GetProfileHandler,
  GetProjectsHandler,
  GetTasksHandler,
  GetTaskHandler,
  GetCommentsHandler,
];

const EventHandlers = [UserRegisteredHandler, ProjectProjection, TaskProjection, CommentProjection];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController, ProjectsController, TasksController, CommentsController],
  providers: [
    JwtStrategy,
    { provide: 'IEventStore', useClass: InMemoryEventStore },
    InMemoryUserReadRepository,
    InMemoryProjectReadRepository,
    InMemoryTaskReadRepository,
    InMemoryCommentReadRepository,
    EventReplayer,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class AppModule {}
