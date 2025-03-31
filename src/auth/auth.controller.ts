import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: { id: string; password: string; phone: string }) {
    return this.authService.signup(body.id, body.password, body.phone);
  }

  @Post('login')
  login(@Body() body: { id: string; password: string }) {
    return this.authService.login(body.id, body.password);
  }
}
