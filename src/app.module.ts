import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { User, UserSchema } from './auth/user.schema';
import { JwtStrategy } from './auth/jwt.strategy';

import { HistoryModule } from './history/history.module';

import { PreprocessModule } from './preprocess/preprocess.module';
import { EvalResultModule } from './evaluate-result/eval-result.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MongoDB_URI!),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HistoryModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
    PreprocessModule,
    EvalResultModule
    
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}
