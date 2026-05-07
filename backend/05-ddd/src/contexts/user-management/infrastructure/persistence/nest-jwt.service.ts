import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtService } from '../../application/commands/login-user.handler';

@Injectable()
export class NestJwtService implements IJwtService {
  constructor(private readonly jwt: JwtService) {}
  sign(payload: { sub: string; email: string }): string {
    return this.jwt.sign(payload);
  }
}
