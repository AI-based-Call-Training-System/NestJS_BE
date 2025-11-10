import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EvalResult } from './eval-result.schema';

@Injectable()
export class EvalResultService {
  constructor(
    @InjectModel(EvalResult.name)
    private readonly evalResultModel: Model<EvalResult>,
  ) {}

  async saveScores(session_id: string, scores: any[]) {
    return await this.evalResultModel.findOneAndUpdate(
      { session_id },       // 조건: 같은 session_id 문서 찾기
      { scores },           // 업데이트할 내용
      { upsert: true, new: true } // 없으면 새로 만들고, 만든 문서 반환
    ).exec();
  }

  async getScores(sessionId: string) {
    return this.evalResultModel.findOne({ sessionId });
  }
}
