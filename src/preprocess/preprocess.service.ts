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
    // _id 기준으로 존재하면 덮어쓰기, 없으면 새로 생성
    return this.preprocessModel.findOneAndUpdate(
      { _id: data._id },   // PK 기준
      data,                // 업데이트할 데이터
      { new: true, upsert: true }  // upsert: 없으면 생성, new: 최신 문서 반환
    ).exec();
  }

  async getAll(): Promise<Preprocess[]> {
    return this.preprocessModel.find().exec();
  }
}
