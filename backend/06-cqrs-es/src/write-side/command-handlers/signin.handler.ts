import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SigninCommand } from '../commands/signin.command';
import { User } from '../aggregates/user.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(SigninCommand)
export class SigninHandler implements ICommandHandler<SigninCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SigninCommand): Promise<{ userId: string; token: string }> {
    const registered = await this.eventStore.getEventsByType('UserRegistered');
    const match = registered.find((e) => e.data.email === command.email);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const history = await this.eventStore.getEvents(match.aggregateId);
    const user = User.fromHistory(match.aggregateId, history);

    const valid = await bcrypt.compare(command.password, user.getHashedPassword()!);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      userId: match.aggregateId,
      token: this.jwtService.sign({ sub: match.aggregateId, email: command.email }),
    };
  }
}
