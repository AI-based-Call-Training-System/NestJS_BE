import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { EvalResultService } from './eval-result.service';

@Controller('eval_result')
export class EvalResultController {
  constructor(private readonly evalResultService: EvalResultService) {}

  @Post("save")
  async saveEvalResult(
    @Body() body: { session_id: string; scores: any[] },
  ) {
    const { session_id, scores } = body;
    return await this.evalResultService.saveScores(session_id, scores);
  }

  @Get(':sessionId')
  async getEvalResult(@Param('sessionId') sessionId: string) {
    return await this.evalResultService.getScores(sessionId);
  }
}
