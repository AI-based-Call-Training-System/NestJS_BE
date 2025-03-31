import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body('userId') userId: string,
    @Body('password') password: string,
    @Body('phoneNumber') phoneNumber: string,
  ): Promise<string> {
    return this.authService.signup(userId, password, phoneNumber);
  }

  @Post('login')
  async login(
    @Body('userId') userId: string,
    @Body('password') password: string,
  ): Promise<string> {
    return this.authService.login(userId, password);
  }
}
