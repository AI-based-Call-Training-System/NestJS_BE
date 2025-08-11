import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

// 로그인 결과 타입 정의
export type LoginResult =
  | { ok: true; access_token: string }
  | { ok: false; message: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입
  async signup(userId: string, password: string, phoneNumber?: string) {
    const exists = await this.userModel.exists({ userId });
    if (exists) return { message: '이미 존재하는 ID 입니다.' };

    const user = new this.userModel({ userId, password, phoneNumber });
    await user.save();
    return { message: '회원가입이 완료되었습니다.' };
  }

  // 로그인
  async login(userId: string, password: string): Promise<LoginResult> {
    const user = await this.userModel.findOne({ userId });
    if (!user) return { ok: false, message: '존재하지 않는 ID 입니다.' };

    const ok = user.password === password;
    if (!ok) return { ok: false, message: '비밀번호가 일치하지 않습니다.' };

    const payload = { sub: user.userId.toString(), userId: user.userId };
    const access_token = await this.jwtService.signAsync(payload);
    return { ok: true, access_token };
  }
}
