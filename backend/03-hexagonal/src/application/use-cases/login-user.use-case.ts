import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  LoginCommand,
  LoginUserPort,
  AuthResult,
  UserRepositoryPort,
  HashServicePort,
  JwtServicePort,
} from '../../ports';

@Injectable()
export class LoginUserUseCase implements LoginUserPort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtServicePort,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.hashService.compare(command.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { user, accessToken };
  }
}
