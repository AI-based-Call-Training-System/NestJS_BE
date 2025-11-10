import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvalResultController } from './eval-result.controller';
import { EvalResultService } from './eval-result.service';
import { EvalResult, EvalResultSchema } from './eval-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EvalResult.name, schema: EvalResultSchema },
    ]),
  ],
  controllers: [EvalResultController],
  providers: [EvalResultService],
})
export class EvalResultModule {}
