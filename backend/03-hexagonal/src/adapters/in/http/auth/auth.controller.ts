import { Controller, Post, Body } from '@nestjs/common';
import { RegisterDto, LoginDto } from './auth.dto';
import { RegisterUserPort, LoginUserPort } from '../../../../ports';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserPort,
    private readonly loginUseCase: LoginUserPort,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      accessToken: result.accessToken,
    };
  }
}
