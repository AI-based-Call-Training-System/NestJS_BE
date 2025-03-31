import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async signup(
    userId: string,
    password: string,
    phoneNumber: string,
  ): Promise<string> {
    const existingUser = await this.userModel.findOne({ userId });
    if (existingUser) {
      return 'This ID is already taken.';
    }

    const user = new this.userModel({ userId, password, phoneNumber });
    await user.save();
    return 'Signup successful!';
  }

  async login(userId: string, password: string): Promise<string> {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      return 'ID does not exist.';
    }
    if (user.password !== password) {
      return 'Incorrect password.';
    }
    return 'Login successful!';
  }
}
