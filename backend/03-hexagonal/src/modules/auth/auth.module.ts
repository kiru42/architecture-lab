import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../../adapters/in/http/auth/auth.controller';
import { JwtStrategy } from '../../adapters/out/auth';
import {
  GetProfileUseCase,
  SigninUseCase,
  SignupUseCase,
} from '../../application/use-cases';
import { PrismaModule } from '../infrastructure/prisma.module';
import { ISignupUseCase } from '../../domain/ports/primary/signup.usecase.interface';
import { ISigninUseCase } from '../../domain/ports/primary/signin.usecase.interface';
import { IGetProfileUseCase } from '../../domain/ports/primary/get-profile.usecase.interface';

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
    JwtStrategy,
    { provide: ISignupUseCase, useClass: SignupUseCase },
    { provide: ISigninUseCase, useClass: SigninUseCase },
    { provide: IGetProfileUseCase, useClass: GetProfileUseCase },
  ],
})
export class AuthModule {}
