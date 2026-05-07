import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { LoginUserCommand } from '../../application/commands/login-user.command';

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
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const userId = await this.commandBus.execute(new RegisterUserCommand(dto.email, dto.password, dto.name));
    return { userId };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.commandBus.execute(new LoginUserCommand(dto.email, dto.password));
    return { access_token: token };
  }
}
