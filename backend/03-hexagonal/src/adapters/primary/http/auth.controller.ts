import { Controller, Post, Get, Body, UseGuards, Request, Inject } from '@nestjs/common';
import { SignupDto, SigninDto } from './dto/auth.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  ISignupUseCase,
  ISignupUseCase as ISignupUseCaseToken,
} from '@domain/ports/primary/signup.usecase.interface';
import {
  ISigninUseCase,
  ISigninUseCase as ISigninUseCaseToken,
} from '@domain/ports/primary/signin.usecase.interface';
import {
  IGetProfileUseCase,
  IGetProfileUseCase as IGetProfileUseCaseToken,
} from '@domain/ports/primary/get-profile.usecase.interface';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(ISignupUseCaseToken)
    private readonly signupUseCase: ISignupUseCase,
    @Inject(ISigninUseCaseToken)
    private readonly signinUseCase: ISigninUseCase,
    @Inject(IGetProfileUseCaseToken)
    private readonly getProfileUseCase: IGetProfileUseCase,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const result = await this.signupUseCase.execute(
      dto.email,
      dto.password,
      dto.name,
    );
    const { password, ...user } = result.user;
    return {
      user,
      token: result.token,
    };
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto) {
    const result = await this.signinUseCase.execute(dto.email, dto.password);
    const { password, ...user } = result.user;
    return {
      user,
      token: result.token,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.getProfileUseCase.execute(req.user.userId);
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
