import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { RegisterUseCase } from '../../core/application/use-cases/register.use-case';
import { LoginUseCase } from '../../core/application/use-cases/login.use-case';
import { GetProfileUseCase } from '../../core/application/use-cases/get-profile.use-case';
import { SigninRequestDto, SignupRequestDto } from './auth.dto';
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
  async signup(@Body() dto: SignupRequestDto) {
    return this.registerUseCase.execute({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: SigninRequestDto) {
    return this.loginUseCase.execute({ email: dto.email, password: dto.password });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: CurrentUserData) {
    return this.getProfileUseCase.execute(user.userId);
  }
}
