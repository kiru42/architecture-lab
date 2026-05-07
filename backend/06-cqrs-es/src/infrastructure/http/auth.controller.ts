import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../write-side/commands/register-user.command';
import { LoginUserCommand } from '../../write-side/commands/login-user.command';
import { GetUsersQuery } from '../../read-side/queries/get-users.query';
import { GetUserByIdQuery } from '../../read-side/queries/get-user-by-id.query';
import { v4 as uuid } from 'uuid';

class RegisterDto {
  email: string;
  password: string;
  name: string;
}

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const userId = uuid();
    await this.commandBus.execute(
      new RegisterUserCommand(userId, dto.email, dto.password, dto.name),
    );
    return { userId };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.commandBus.execute(new LoginUserCommand(dto.email, dto.password));
    return { access_token: token };
  }

  @Get('users')
  async getUsers() {
    return this.queryBus.execute(new GetUsersQuery());
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }
}
