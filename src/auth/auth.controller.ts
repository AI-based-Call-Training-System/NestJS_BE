import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

type JwtUser = { userId: string; userMongoId: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('signup')
  async signup(
    @Body('id') id: string,
    @Body('password') password: string,
    @Body('phoneNumber') phoneNumber?: string,
  ) {
    return this.authService.signup(id, password, phoneNumber);
  }

  // 로그인
  @Post('login')
  async login(@Body('id') id: string, @Body('password') password: string) {
    const result = await this.authService.login(id, password);

    if (!result.ok) {
      throw new UnauthorizedException(result.message);
    }
    return { access_token: result.access_token };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  profile(@Req() req: Request & { user: JwtUser }) {
    return { user: req.user };
  }
}
