import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '../../domain';
import {
  RegisterCommand,
  RegisterUserPort,
  AuthResult,
  UserRepositoryPort,
  HashServicePort,
  JwtServicePort,
} from '../../ports';

@Injectable()
export class RegisterUserUseCase implements RegisterUserPort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtServicePort,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashService.hash(command.password);
    const user = User.create(
      crypto.randomUUID(),
      command.email,
      passwordHash,
      command.name,
    );

    const created = await this.userRepository.create(user);
    const accessToken = this.jwtService.sign({
      sub: created.id,
      email: created.email,
    });

    return { user: created, accessToken };
  }
}
