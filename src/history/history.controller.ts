import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';
import { QueryHistoryDto } from './dto/query-history.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':userId')
  getByUserId(
    @Param('userId') userId: string,
    @Query() query: QueryHistoryDto,
  ) {
    return this.historyService.getHistoryByUserId(userId, query);
  }
}
