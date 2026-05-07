import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

// Event Store
import { InMemoryEventStore } from './infrastructure/event-store/in-memory-event-store';

// Write Side
import { RegisterUserHandler } from './write-side/command-handlers/register-user.handler';
import { LoginUserHandler } from './write-side/command-handlers/login-user.handler';

// Read Side
import { InMemoryUserReadRepository } from './infrastructure/read-models/in-memory-user-read-repository';
import { UserRegisteredHandler } from './read-side/event-handlers/user-registered.handler';
import { GetUsersHandler } from './read-side/query-handlers/get-users.handler';
import { GetUserByIdHandler } from './read-side/query-handlers/get-user-by-id.handler';

// HTTP
import { AuthController } from './infrastructure/http/auth.controller';

// Event Replayer (rebuild projections from event store)
import { EventReplayer } from './infrastructure/event-store/event-replayer';

const CommandHandlers = [RegisterUserHandler, LoginUserHandler];
const QueryHandlers = [GetUsersHandler, GetUserByIdHandler];
const EventHandlers = [UserRegisteredHandler];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: 'IEventStore', useClass: InMemoryEventStore },
    InMemoryUserReadRepository,
    EventReplayer,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class AppModule {}
