import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../../../core/application/services/auth.service';
import { SigninDto, SignupDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const { user, token } = await this.authService.signup(dto);
    return { user: user.toPublic(), token };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: SigninDto) {
    const { user, token } = await this.authService.signin(dto);
    return { user: user.toPublic(), token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('userId') userId: string) {
    const user = await this.authService.getProfile(userId);
    return user.toPublic();
  }
}
