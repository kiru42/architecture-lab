import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { RegisterUserCommand } from '../commands/register-user.command';
import { User } from '../aggregates/user.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';
import * as bcrypt from 'bcrypt';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(@Inject('IEventStore') private readonly eventStore: IEventStore) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    // Check if user already exists (by checking event store)
    const existingEvents = await this.eventStore.getEvents(command.userId);
    if (existingEvents.length > 0) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(command.password, 10);

    // Create aggregate
    const user = User.register(command.userId, command.email, hashedPassword, command.name);

    // Save events to event store
    const events = user.getUncommittedEvents();
    await this.eventStore.appendEvents(command.userId, events, 0);

    user.clearUncommittedEvents();
  }
}
