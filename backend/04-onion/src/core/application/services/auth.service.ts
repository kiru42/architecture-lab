import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IHashService } from '../interfaces/hash-service.interface';
import { IJwtService } from '../interfaces/jwt-service.interface';

export interface SignupCommand {
  email: string;
  password: string;
  name: string;
}

export interface SigninCommand {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IHashService') private readonly hashService: IHashService,
    @Inject('IJwtService') private readonly jwtService: IJwtService,
  ) {}

  async signup(command: SignupCommand): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashService.hash(command.password);
    const user = await this.userRepository.create(
      User.create(command.email, passwordHash, command.name),
    );

    return { user, token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }

  async signin(command: SigninCommand): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await this.hashService.compare(command.password, user.getPasswordHash());
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { user, token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
