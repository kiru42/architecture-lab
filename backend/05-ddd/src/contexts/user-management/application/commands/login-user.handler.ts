import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { LoginUserCommand } from './login-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';

export interface IHashService {
  compare(plainText: string, hash: string): Promise<boolean>;
}

export interface IJwtService {
  sign(payload: { sub: string; email: string }): string;
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IHashService') private readonly hashService: IHashService,
    @Inject('IJwtService') private readonly jwtService: IJwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<string> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.hashService.compare(
      command.password,
      user.getHashedPassword().getValue(),
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.jwtService.sign({
      sub: user.getId().getValue(),
      email: user.getEmail().getValue(),
    });
  }
}
