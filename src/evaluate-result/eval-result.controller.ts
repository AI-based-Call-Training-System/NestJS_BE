import { Controller, Post, Get, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EvalResultService } from './eval-result.service';
import { log } from 'console';

@Controller('eval_result')
export class EvalResultController {
  constructor(private readonly evalResultService: EvalResultService) {}

  // POST: FastAPI에서 저장
  @Post('save')
  async saveResult(@Body() data: any, @Res() res: Response) {
    try {
      console.log('받은 데이터:', JSON.stringify(data, null, 2));

      const result = await this.evalResultService.saveResult(data);
      console.log('✅ DB 저장 완료:', result);

      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      console.error('저장 실패:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '저장 실패' });
    }
  }

  // ✅ GET: FastAPI에서 조회할 때 사용
  @Get(':session_id')
  async getResult(@Param('session_id') sessionId: string, @Res() res: Response) {
    try {
      const result = await this.evalResultService.findBySessionId(sessionId);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: '결과 없음' });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('조회 실패:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '조회 실패' });
    }
  }
}
