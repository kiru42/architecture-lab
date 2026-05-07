import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../core/application/services/auth.service';
import { IUserRepository } from '../core/application/interfaces/user-repository.interface';
import { IHashService } from '../core/application/interfaces/hash-service.interface';
import { IJwtService } from '../core/application/interfaces/jwt-service.interface';
import { PrismaUserRepository } from './persistence/prisma/user.repository';
import { BcryptHashService } from './security/bcrypt-hash.service';
import { JwtTokenService } from './security/jwt-token.service';
import { JwtStrategy } from './web/middleware/jwt.strategy';
import { AuthController } from './web/controllers/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IHashService', useClass: BcryptHashService },
    { provide: 'IJwtService', useClass: JwtTokenService },
  ],
  exports: [AuthService],
})
export class AuthModule {}
