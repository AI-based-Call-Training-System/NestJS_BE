import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('signup')
  async signup(
    @Body('name') userId: string,
    @Body('password') password: string,
    @Body('phone') phoneNumber: string,
  ): Promise<string> {
    return this.authService.signup(userId, password, phoneNumber);
  }

  // 로그인
  @Post('login')
  async login(
    @Body('id') userId: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(userId, password);

    if (result === '로그인이 완료되었습니다!') {
      return res.status(HttpStatus.OK).send(result);
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send(result);
    }
  }
}
