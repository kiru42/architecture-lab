import { Body, Controller, Get, HttpCode, Inject, Post, UseGuards } from '@nestjs/common';
import { SigninDto, SignupDto } from './auth.dto';
import { ISigninUseCase } from '../../../../domain/ports/primary/signin.usecase.interface';
import { ISignupUseCase } from '../../../../domain/ports/primary/signup.usecase.interface';
import { IGetProfileUseCase } from '../../../../domain/ports/primary/get-profile.usecase.interface';
import { JwtAuthGuard } from '../../../out/auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(ISignupUseCase) private readonly signupUseCase: ISignupUseCase,
    @Inject(ISigninUseCase) private readonly signinUseCase: ISigninUseCase,
    @Inject(IGetProfileUseCase) private readonly getProfileUseCase: IGetProfileUseCase,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const { user, token } = await this.signupUseCase.execute(dto.email, dto.password, dto.name);
    return { user: user.toPublic(), token };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: SigninDto) {
    const { user, token } = await this.signinUseCase.execute(dto.email, dto.password);
    return { user: user.toPublic(), token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('userId') userId: string) {
    const user = await this.getProfileUseCase.execute(userId);
    return user.toPublic();
  }
}
