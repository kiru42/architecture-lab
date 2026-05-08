import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password, dto.name);
  }

  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: { id: string; email: string }) {
    return this.authService.getMe(user.id);
  }
}
