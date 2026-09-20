import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SigninDto, SignupDto } from './auth.dto';
import { SignupCommand } from '../../application/commands/signup.command';
import { SignupResult } from '../../application/commands/signup.handler';
import { SigninCommand } from '../../application/commands/signin.command';
import { SigninResult } from '../../application/commands/signin.handler';
import { GetProfileQuery } from '../../application/queries/get-profile.query';
import { User } from '../../domain/aggregates/user.aggregate';
import { JwtAuthGuard } from '../../../../shared-kernel/infrastructure/http/jwt-auth.guard';
import { CurrentUser } from '../../../../shared-kernel/infrastructure/http/current-user.decorator';

/** The public User projection from openapi.yaml — never exposes the hash. */
function toPublic(user: User) {
  return {
    id: user.getId().getValue(),
    email: user.getEmail().getValue(),
    name: user.getName().getValue(),
    createdAt: user.getCreatedAt(),
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const result: SignupResult = await this.commandBus.execute(
      new SignupCommand(dto.email, dto.password, dto.name),
    );
    return { user: toPublic(result.user), token: result.token };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: SigninDto) {
    const result: SigninResult = await this.commandBus.execute(
      new SigninCommand(dto.email, dto.password),
    );
    return { user: toPublic(result.user), token: result.token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('userId') userId: string) {
    const user: User = await this.queryBus.execute(new GetProfileQuery(userId));
    return toPublic(user);
  }
}
