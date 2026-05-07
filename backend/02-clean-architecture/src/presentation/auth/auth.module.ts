import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { RegisterUseCase } from '../../core/application/use-cases/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/login.use-case';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, RegisterUseCase, LoginUseCase],
})
export class AuthModule {}
