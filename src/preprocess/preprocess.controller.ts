import { Controller, Get, Post, Body } from '@nestjs/common';
import { PreprocessService } from './preprocess.service';
import { Preprocess } from './preprocess.schema';

@Controller('preprocess')
export class PreprocessController {
  constructor(private readonly preprocessService: PreprocessService) {}

  @Post()
  async create(@Body() preprocess: Preprocess) {
    return this.preprocessService.savePreprocess(preprocess);
  }

  @Get()
  async findAll(): Promise<Preprocess[]> {
    return this.preprocessService.getAll();
  }
}
