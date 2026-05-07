import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtServicePort, JwtPayload } from '../../../ports';

@Injectable()
export class JwtTokenService implements JwtServicePort {
  constructor(private readonly nestJwtService: NestJwtService) {}

  sign(payload: JwtPayload): string {
    return this.nestJwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.nestJwtService.verify<JwtPayload>(token);
  }
}
