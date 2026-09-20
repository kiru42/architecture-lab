import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupCommand } from '../commands/signup.command';
import { User } from '../aggregates/user.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<SignupCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SignupCommand): Promise<{ userId: string; token: string }> {
    // Email uniqueness is a write-side invariant, so it is checked against the
    // event stream rather than the read model — projections are eventually
    // consistent and must not be used to guard a write.
    const registered = await this.eventStore.getEventsByType('UserRegistered');
    if (registered.some((e) => e.data.email === command.email)) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(command.password, 10);
    const user = User.register(command.userId, command.email, hashedPassword, command.name);

    const events = user.getUncommittedEvents();
    await this.eventStore.appendEvents(command.userId, events, 0);

    // Without this the read side never learns the user exists.
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    user.clearUncommittedEvents();

    return {
      userId: command.userId,
      token: this.jwtService.sign({ sub: command.userId, email: command.email }),
    };
  }
}
