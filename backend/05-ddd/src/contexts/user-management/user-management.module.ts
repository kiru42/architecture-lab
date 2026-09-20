import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/http/auth.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { BcryptHashService } from './infrastructure/security/bcrypt-hash.service';
import { NestJwtService } from './infrastructure/security/nest-jwt.service';
import { JwtStrategy } from '../../shared-kernel/infrastructure/http/jwt.strategy';
import { SignupHandler } from './application/commands/signup.handler';
import { SigninHandler } from './application/commands/signin.handler';
import { GetProfileHandler } from './application/queries/get-profile.handler';
import { IUserRepository } from './domain/repositories/user.repository';
import { IHashService } from './application/ports/hash-service.port';
import { IJwtService } from './application/ports/jwt-service.port';

const CommandHandlers = [SignupHandler, SigninHandler];
const QueryHandlers = [GetProfileHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IHashService, useClass: BcryptHashService },
    { provide: IJwtService, useClass: NestJwtService },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [IUserRepository],
})
export class UserManagementModule {}
