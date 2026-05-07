import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserCommand } from '../commands/login-user.command';
import { IEventStore } from '../../event-store/event-store.interface';
import { User } from '../aggregates/user.aggregate';
import * as bcrypt from 'bcrypt';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<string> {
    // Find user by email (scan all UserRegistered events)
    const allEvents = await this.eventStore.getEventsByType('UserRegistered');
    const userEvent = allEvents.find((e) => e.data.email === command.email);

    if (!userEvent) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reconstitute user from events
    const userEvents = await this.eventStore.getEvents(userEvent.aggregateId);
    const user = User.fromHistory(userEvent.aggregateId, userEvents);

    // Validate password
    const isValid = await bcrypt.compare(command.password, user.getHashedPassword()!);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    return this.jwtService.sign({
      sub: user.getId(),
      email: user.getEmail(),
    });
  }
}
