// src/preprocess/preprocess.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preprocess, PreprocessDocument } from './preprocess.schema';

@Injectable()
export class PreprocessService {
  constructor(
    @InjectModel(Preprocess.name) private preprocessModel: Model<PreprocessDocument>,
  ) {}

 async savePreprocess(data: any): Promise<Preprocess> {
    return this.preprocessModel.findOneAndUpdate(
      { session_id: data.session_id }, // PK처럼 사용
      { $set: data },                 // 기존 문서 덮어쓰기
      { upsert: true, new: true }     // 없으면 생성, 최신 문서 반환
    ).exec();
  }

  async getAll(): Promise<Preprocess[]> {
    return this.preprocessModel.find().exec();
  }
}
