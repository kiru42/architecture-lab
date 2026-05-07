import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../../adapters/in/http/auth/auth.controller';
import { RegisterUserUseCase, LoginUserUseCase } from '../../application';
import { BcryptHashService, JwtTokenService, JwtStrategy } from '../../adapters/out/auth';
import { PrismaModule } from '../infrastructure/prisma.module';

// Port tokens
export const REGISTER_USER_PORT = 'RegisterUserPort';
export const LOGIN_USER_PORT = 'LoginUserPort';
export const HASH_SERVICE_PORT = 'HashServicePort';
export const JWT_SERVICE_PORT = 'JwtServicePort';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use case implementations
    {
      provide: REGISTER_USER_PORT,
      useClass: RegisterUserUseCase,
    },
    {
      provide: LOGIN_USER_PORT,
      useClass: LoginUserUseCase,
    },
    // Service adapters
    {
      provide: HASH_SERVICE_PORT,
      useClass: BcryptHashService,
    },
    {
      provide: JWT_SERVICE_PORT,
      useClass: JwtTokenService,
    },
    JwtStrategy,
  ],
  exports: [JWT_SERVICE_PORT],
})
export class AuthModule {}
