import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRepository } from '../../domain';
import { RegisterDto, AuthResultDto } from '../dtos/auth.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResultDto> {
    // Check if user exists
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create domain entity
    const user = User.create(dto.email, hashedPassword, dto.name);

    // Persist
    const saved = await this.userRepository.save(user);

    // Generate JWT
    const payload = { sub: saved.id, email: saved.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: saved.id,
        email: saved.email,
        name: saved.name,
      },
    };
  }
}
