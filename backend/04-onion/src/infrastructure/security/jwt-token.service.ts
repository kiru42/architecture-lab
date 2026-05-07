import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService } from '../../core/application/interfaces/jwt-service.interface';

@Injectable()
export class JwtTokenService implements IJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  sign(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): { sub: string; email: string } {
    return this.jwtService.verify(token);
  }
}
