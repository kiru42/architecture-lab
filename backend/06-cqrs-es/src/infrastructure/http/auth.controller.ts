import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { SignupCommand } from '../../write-side/commands/signup.command';
import { SigninCommand } from '../../write-side/commands/signin.command';
import { GetProfileQuery } from '../../read-side/queries/get-profile.query';
import { UserReadModel } from '../../read-side/projections/user-read-model';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

/** Public projection required by openapi.yaml — never the password hash. */
function toPublic(user: UserReadModel) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.registeredAt,
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('signup')
  async signup(@Body() dto: { email: string; password: string; name: string }) {
    const { userId, token } = await this.commandBus.execute(
      new SignupCommand(uuid(), dto.email, dto.password, dto.name),
    );
    const user: UserReadModel = await this.queryBus.execute(new GetProfileQuery(userId));
    return { user: toPublic(user), token };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: { email: string; password: string }) {
    const { userId, token } = await this.commandBus.execute(
      new SigninCommand(dto.email, dto.password),
    );
    const user: UserReadModel = await this.queryBus.execute(new GetProfileQuery(userId));
    return { user: toPublic(user), token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('userId') userId: string) {
    const user: UserReadModel = await this.queryBus.execute(new GetProfileQuery(userId));
    return toPublic(user);
  }
}
