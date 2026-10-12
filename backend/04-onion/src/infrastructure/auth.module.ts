import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../core/application/services/auth.service';
import { BcryptHashService } from './security/bcrypt-hash.service';
import { JwtTokenService } from './security/jwt-token.service';
import { JwtStrategy } from './web/middleware/jwt.strategy';
import { AuthController } from './web/controllers/auth.controller';
import { PrismaModule } from './persistence/prisma.module';

@Module({
  imports: [
    PrismaModule,
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
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: 'IHashService', useClass: BcryptHashService },
    { provide: 'IJwtService', useClass: JwtTokenService },
  ],
  exports: [AuthService],
})
export class AuthModule {}
