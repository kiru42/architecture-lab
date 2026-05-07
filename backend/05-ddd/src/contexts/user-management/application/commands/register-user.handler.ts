import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../../domain/value-objects/user-name.vo';
import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';

export interface IHashService {
  hash(plainText: string): Promise<string>;
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IHashService') private readonly hashService: IHashService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<string> {
    const email = Email.create(command.email);
    
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = HashedPassword.fromHash(
      await this.hashService.hash(command.password),
    );
    const name = UserName.create(command.name);
    const userId = UserId.generate();

    const user = User.register(userId, email, hashedPassword, name);

    await this.userRepository.save(user);

    // Publish domain events
    user.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    user.clearDomainEvents();

    return userId.getValue();
  }
}
