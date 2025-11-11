import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EvalResult } from './eval-result.schema';

@Injectable()
export class EvalResultService {
  constructor(@InjectModel(EvalResult.name) private evalResultModel: Model<EvalResult>) {}

  async saveResult(data: any) {
    const { session_id, scores } = data;
    return await this.evalResultModel.findOneAndUpdate(
      { session_id },
      { session_id, scores, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async findBySessionId(session_id: string) {
    return this.evalResultModel.findOne({ session_id });
  }
}
