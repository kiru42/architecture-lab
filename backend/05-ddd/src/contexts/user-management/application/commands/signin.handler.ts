import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { SigninCommand } from './signin.command';
import {
  IUserRepository,
  IUserRepository as IUserRepositoryToken,
} from '../../domain/repositories/user.repository';
import { IHashService, IHashService as IHashServiceToken } from '../ports/hash-service.port';
import { IJwtService, IJwtService as IJwtServiceToken } from '../ports/jwt-service.port';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';
import { User } from '../../domain/aggregates/user.aggregate';

export interface SigninResult {
  user: User;
  token: string;
}

@CommandHandler(SigninCommand)
export class SigninHandler implements ICommandHandler<SigninCommand> {
  constructor(
    @Inject(IUserRepositoryToken) private readonly userRepository: IUserRepository,
    @Inject(IHashServiceToken) private readonly hashService: IHashService,
    @Inject(IJwtServiceToken) private readonly jwtService: IJwtService,
  ) {}

  async execute(command: SigninCommand): Promise<SigninResult> {
    const user = await this.userRepository.findByEmail(Email.create(command.email));
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await this.hashService.compare(
      command.password,
      user.getHashedPassword().getValue(),
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user,
      token: this.jwtService.sign({
        sub: user.getId().getValue(),
        email: user.getEmail().getValue(),
      }),
    };
  }
}
