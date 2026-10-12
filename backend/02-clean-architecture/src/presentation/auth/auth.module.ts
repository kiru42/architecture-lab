import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { RegisterUseCase } from '../../core/application/use-cases/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/login.use-case';
import { GetProfileUseCase } from '../../core/application/use-cases/get-profile.use-case';
import { AuthController } from './auth.controller';
import { requireJwtSecret } from '../../infrastructure/auth/jwt-secret';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: requireJwtSecret(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, RegisterUseCase, LoginUseCase, GetProfileUseCase],
})
export class AuthModule {}
