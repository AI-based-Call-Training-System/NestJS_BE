import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';
import {
  AppendMessageDto,
  CreateSessionDto,
  QueryMessagesDto,
  QuerySessionsDto,
  UpdateSessionMetaDto,
} from './dto/query-history.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // 세션 생성
  @Post(':userId/sessions')
  createSession(
    @Param('userId') userId: string,
    @Body() body: CreateSessionDto,
  ) {
    return this.historyService.createSession(userId, body);
  }

  // 세션 목록 (키워드 검색)
  @Get(':userId/sessions')
  listSessions(
    @Param('userId') userId: string,
    @Query() query: QuerySessionsDto,
  ) {
    return this.historyService.listSessions(userId, query);
  }

  // 특정 세션의 메시지 목록 (키워드 검색)
  @Get(':userId/:sessionId')
  getMessages(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.historyService.getMessagesBySession(userId, sessionId, query);
  }

  // 세션 메타 업데이트
  @Patch(':userId/:sessionId/meta')
  updateMeta(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: UpdateSessionMetaDto,
  ) {
    return this.historyService.updateSessionMeta(userId, sessionId, body);
  }

  // 메시지 추가
  @Post(':userId/:sessionId/messages')
  appendMessage(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: AppendMessageDto,
  ) {
    return this.historyService.appendMessage(userId, sessionId, body);
  }

  // (호환) userId만으로 요청하면 세션 목록 반환
  @Get(':userId')
  getFallback(
    @Param('userId') userId: string,
    @Query() query: QuerySessionsDto,
  ) {
    return this.historyService.listSessions(userId, query);
  }
}
