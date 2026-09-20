import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { SignupCommand } from './signup.command';
import {
  IUserRepository,
  IUserRepository as IUserRepositoryToken,
} from '../../domain/repositories/user.repository';
import { IHashService, IHashService as IHashServiceToken } from '../ports/hash-service.port';
import { IJwtService, IJwtService as IJwtServiceToken } from '../ports/jwt-service.port';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../../domain/value-objects/user-name.vo';
import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';

/** Result of a successful signup: the created aggregate plus its token. */
export interface SignupResult {
  user: User;
  token: string;
}

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<SignupCommand> {
  constructor(
    @Inject(IUserRepositoryToken) private readonly userRepository: IUserRepository,
    @Inject(IHashServiceToken) private readonly hashService: IHashService,
    @Inject(IJwtServiceToken) private readonly jwtService: IJwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SignupCommand): Promise<SignupResult> {
    const email = Email.create(command.email);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = HashedPassword.fromHash(await this.hashService.hash(command.password));
    const user = User.register(
      UserId.generate(),
      email,
      hashedPassword,
      UserName.create(command.name),
    );

    await this.userRepository.save(user);
    user.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    user.clearDomainEvents();

    return {
      user,
      token: this.jwtService.sign({
        sub: user.getId().getValue(),
        email: user.getEmail().getValue(),
      }),
    };
  }
}
