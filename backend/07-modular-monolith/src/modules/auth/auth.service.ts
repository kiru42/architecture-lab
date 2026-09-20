import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, password: hashed, name });
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { user: this.toPublicUser(user), token };
  }

  async signin(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: this.toPublicUser(user), token };
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(userId);
    return this.toPublicUser(user);
  }

  /**
   * The only user representation that leaves the module. Built field by field,
   * so the password hash is not reachable from the caller at all.
   */
  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
