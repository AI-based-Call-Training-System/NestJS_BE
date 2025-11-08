import { Controller, Post, Body } from '@nestjs/common';
import { PreprocessService } from './preprocess.service';
import { Preprocess } from './preprocess.schema';

@Controller('preprocess')
export class PreprocessController {
  constructor(private readonly preprocessService: PreprocessService) {}

  @Post('save')
  async save(@Body() data: any): Promise<Preprocess> {
    return this.preprocessService.savePreprocess(data);
  }
}
