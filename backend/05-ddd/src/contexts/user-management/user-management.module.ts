import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './infrastructure/http/auth.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { BcryptHashService } from './infrastructure/persistence/bcrypt-hash.service';
import { NestJwtService } from './infrastructure/persistence/nest-jwt.service';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { LoginUserHandler } from './application/commands/login-user.handler';
import { GetUserHandler } from './application/queries/get-user.handler';

const CommandHandlers = [RegisterUserHandler, LoginUserHandler];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaClient,
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IHashService', useClass: BcryptHashService },
    { provide: 'IJwtService', useClass: NestJwtService },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IUserRepository'],
})
export class UserManagementModule {}
