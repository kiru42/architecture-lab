import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUseCase, LoginUseCase } from '../../core/application/use-cases/register.use-case';
import { RegisterDto, LoginDto } from '../../core/application/dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
