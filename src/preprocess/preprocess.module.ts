// src/preprocess/preprocess.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PreprocessService } from './preprocess.service';
import { PreprocessController } from './preprocess.controller';
import { Preprocess, PreprocessSchema } from './preprocess.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Preprocess.name, schema: PreprocessSchema }]),
  ],
  controllers: [PreprocessController],
  providers: [PreprocessService],
  exports:[PreprocessService]
  
})
export class PreprocessModule {}
