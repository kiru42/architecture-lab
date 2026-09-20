import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { RegisterUseCase } from '../../core/application/use-cases/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/login.use-case';
import { GetProfileUseCase } from '../../core/application/use-cases/get-profile.use-case';
import { RegisterDto, LoginDto } from '../../core/application/dtos/auth.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Post('signup')
  async signup(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: CurrentUserData) {
    return this.getProfileUseCase.execute(user.userId);
  }
}
