// src/preprocess/preprocess.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { PreprocessService } from './preprocess.service';

@Controller('preprocess')
export class PreprocessController {
  constructor(private readonly preprocessService: PreprocessService) {}

  @Post('/save')
  async create(@Body() body: any) {
    // body에 JSON 데이터 그대로 전달
    return this.preprocessService.savePreprocess(body);
  }
}
