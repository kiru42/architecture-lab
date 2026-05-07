import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IHashService } from '../interfaces/hash-service.interface';
import { IJwtService } from '../interfaces/jwt-service.interface';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IHashService') private readonly hashService: IHashService,
    @Inject('IJwtService') private readonly jwtService: IJwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await this.hashService.hash(dto.password);
    const user = User.create(crypto.randomUUID(), dto.email, passwordHash, dto.name);

    const created = await this.userRepository.create(user);
    const accessToken = this.jwtService.sign({ sub: created.id, email: created.email });

    return { user: created, accessToken };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.hashService.compare(dto.password, user.getPasswordHash());
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, accessToken };
  }
}
