import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  //비밀번호 형식 검사 메서드
  private validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  //전화번호 형식 검사 메서드
  private validatePhoneNumber(phoneNumber: string): boolean {
    const phoneNumberRegex = /^\d{3}-\d{4}-\d{4}$/;
    return phoneNumberRegex.test(phoneNumber);
  }

  //회원가입 메서드
  async signup(
    userId: string,
    password: string,
    phoneNumber: string,
  ): Promise<string> {
    //비밀번호 형식 검사
    if (!this.validatePassword(password)) {
      return '비밀번호는 8자 이상이며 영문자와 숫자로만 구성되어야 합니다.';
    }
    //전화번호 형식 검사
    if (!this.validatePhoneNumber(phoneNumber)) {
      return '전화번호는 숫자 11자리로만 구성되어야 합니다.';
    }
    //아이디 중복 검사
    const existingUser = await this.userModel.findOne({ userId });
    if (existingUser) {
      return '이미 사용 중인 ID 입니다.';
    }

    const user = new this.userModel({ userId, password, phoneNumber });
    await user.save();
    return '회원가입이 완료되었습니다!';
  }

  //로그인 메서드
  async login(userId: string, password: string): Promise<string> {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      return '존재하지 않는 ID 입니다.';
    }
    if (user.password !== password) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return '로그인이 완료되었습니다!';
  }
}
