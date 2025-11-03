import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  PipelineStage,
  FilterQuery,
  SortOrder,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { Session, SessionDocument } from './history.schema';
import {
  AppendMessageDto,
  CreateSessionDto,
  QueryMessagesDto,
  QuerySessionsDto,
  UpdateSessionMetaDto,
} from './dto/query-history.dto';
import { ulid } from 'ulid';

type MessageItem = {
  messageId: string;
  seq: number;
  role: string;
  content: string;
  timestamp: Date | string;
};

// ID 생성
function newSessionId(): string {
  return `S-${ulid()}`; // 시간 정렬되는 ULID, prefix 부여
}
function newMessageId(): string {
  return ulid();
}

// 날짜 입력 정규화
function normalizeDateInput(val?: string, isTo = false): Date | undefined {
  if (!val) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return isTo
      ? new Date(`${val}T23:59:59.999Z`)
      : new Date(`${val}T00:00:00.000Z`);
  }
  return new Date(val);
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  // 세션 생성 (POST)
  async createSession(userId: string, dto: CreateSessionDto) {
    const doc = await this.sessionModel.create({
      userId,
      sessionId: newSessionId(),
      title: dto.title ?? '',
      tags: dto.tags ?? 'greeting',
      archived: dto.archived ?? false,
      bookmark: dto.bookmark ?? false,
      success: dto.success ?? null,
      messageCount: 0,
      lastMessageAt: null,
      history: [],
    });
    return { ok: true, item: { userId: doc.userId, sessionId: doc.sessionId } };
  }

  // 세션 목록 조회 (GET)
  async listSessions(userId: string, dto: QuerySessionsDto) {
    const {
      keyword,
      tag,
      bookmark,
      archived,
      success,
      sortBy = 'lastMessageAt',
      sortOrder = 'desc',
      skip = 0,
      limit = 50,
    } = dto;

    const baseFilter: FilterQuery<SessionDocument> = { userId };
    if (typeof bookmark === 'boolean') baseFilter.bookmark = bookmark;
    if (typeof archived === 'boolean') baseFilter.archived = archived;
    if (typeof success === 'boolean') baseFilter.success = success;
    if (tag) baseFilter.tags = tag;

    let findFilter: FilterQuery<SessionDocument> = baseFilter;
    let projection: ProjectionType<SessionDocument> | undefined;
    let options: QueryOptions<SessionDocument> | undefined;
    let totalFilter: FilterQuery<SessionDocument> = baseFilter;

    if (keyword && keyword.trim()) {
      findFilter = { ...baseFilter, $text: { $search: keyword } };
      // textScore projection은 타입 단언 필요
      projection = {
        score: { $meta: 'textScore' },
      } as unknown as ProjectionType<SessionDocument>;
      totalFilter = findFilter;
    }

    const sort: Record<string, SortOrder> =
      keyword && keyword.trim() && sortBy === 'score'
        ? ({ score: { $meta: 'textScore' } } as unknown as Record<
            string,
            SortOrder
          >)
        : { [sortBy]: sortOrder === 'asc' ? 1 : -1, _id: 1 };

    const [total, items] = await Promise.all([
      this.sessionModel.countDocuments(totalFilter),
      this.sessionModel
        .find(findFilter, projection, options)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select({
          _id: 0,
          userId: 1,
          sessionId: 1,
          title: 1,
          tags: 1,
          archived: 1,
          bookmark: 1,
          success: 1,
          messageCount: 1,
          lastMessageAt: 1,
        })
        .lean(),
    ]);

    return { ok: true, userId, total, skip, limit, items };
  }

  // 특정 세션의 메시지 조회 (GET)
  async getMessagesBySession(
    userId: string,
    sessionId: string,
    dto: QueryMessagesDto,
  ) {
    const { from, to, role, keyword, skip = 0, limit = 50 } = dto;

    const matchStage: PipelineStage.Match = { $match: { userId, sessionId } };

    const castStage: PipelineStage.AddFields = {
      $addFields: {
        _hist: {
          $map: {
            input: '$history',
            as: 'h',
            in: {
              messageId: '$$h.messageId',
              seq: '$$h.seq',
              role: '$$h.role',
              content: '$$h.content',
              timestamp: '$$h.timestamp',
              ts: {
                $cond: [
                  { $eq: [{ $type: '$$h.timestamp' }, 'date'] },
                  '$$h.timestamp',
                  { $toDate: '$$h.timestamp' },
                ],
              },
            },
          },
        },
      },
    };

    const fromDate = normalizeDateInput(from);
    const toDate = normalizeDateInput(to, true);

    const conds: Record<string, unknown>[] = [];
    if (fromDate) conds.push({ $gte: ['$$h.ts', fromDate] });
    if (toDate) conds.push({ $lte: ['$$h.ts', toDate] });
    if (role) conds.push({ $eq: ['$$h.role', role] });
    if (keyword)
      conds.push({
        $regexMatch: { input: '$$h.content', regex: keyword, options: 'i' },
      });

    const projectStage: PipelineStage.Project =
      conds.length === 0
        ? {
            $project: {
              _id: 0,
              userId: 1,
              sessionId: 1,
              total: { $size: '$_hist' },
              history: {
                $slice: [
                  {
                    $sortArray: {
                      input: '$_hist',
                      sortBy: { ts: 1, seq: 1 },
                    },
                  },
                  skip,
                  limit,
                ],
              },
            },
          }
        : {
            $project: {
              _id: 0,
              userId: 1,
              sessionId: 1,
              _filtered: {
                $filter: {
                  input: '$_hist',
                  as: 'h',
                  cond: conds.length === 1 ? conds[0] : { $and: conds },
                },
              },
            },
          };

    const pipeline: PipelineStage[] = [matchStage, castStage, projectStage];

    if (conds.length > 0) {
      pipeline.push(
        {
          $addFields: {
            _sorted: {
              $sortArray: { input: '$_filtered', sortBy: { ts: -1, seq: -1 } },
            },
          },
        },
        {
          $project: {
            userId: 1,
            sessionId: 1,
            total: { $size: '$_filtered' },
            history: { $slice: ['$_sorted', skip, limit] },
          },
        },
      );
    }

    const out = await this.sessionModel
      .aggregate<{
        userId: string;
        sessionId: string;
        total: number;
        history: MessageItem[];
      }>(pipeline)
      .exec();

    if (!out || out.length === 0) {
      const exists = await this.sessionModel.exists({ userId, sessionId });
      if (!exists) throw new NotFoundException('Session not found');
      return { ok: true, userId, sessionId, total: 0, skip, limit, items: [] };
    }
    return {
      ok: true,
      userId,
      sessionId,
      total: out[0].total,
      skip,
      limit,
      items: out[0].history,
    };
  }

  // 세션 메타 업데이트 (PATCH)
  async updateSessionMeta(
    userId: string,
    sessionId: string,
    dto: UpdateSessionMetaDto,
  ) {
    const res = await this.sessionModel
      .findOneAndUpdate(
        { userId, sessionId },
        { $set: { ...dto } },
        {
          new: true,
          projection: {
            _id: 0,
            userId: 1,
            sessionId: 1,
            title: 1,
            tags: 1,
            archived: 1,
            bookmark: 1,
            success: 1,
            messageCount: 1,
            lastMessageAt: 1,
          },
        },
      )
      .lean();
    if (!res) throw new NotFoundException('Session not found');
    return { ok: true, item: res };
  }

  // 메시지 추가(메타 자동 갱신) (POST)
  async appendMessage(
    userId: string,
    sessionId: string,
    dto: AppendMessageDto,
  ) {
    const msg = {
      messageId: dto.messageId ?? newMessageId(),
      seq: dto.seq,
      role: dto.role,
      content: dto.content,
      timestamp: new Date(dto.timestamp),
    };

    const res = await this.sessionModel
      .findOneAndUpdate(
        { userId, sessionId },
        {
          $push: { history: msg },
          $inc: { messageCount: 1 },
          $max: { lastMessageAt: msg.timestamp },
        },
        {
          new: true,
          projection: {
            _id: 0,
            userId: 1,
            sessionId: 1,
            messageCount: 1,
            lastMessageAt: 1,
          },
        },
      )
      .lean();

    if (!res) throw new NotFoundException('Session not found');
    return { ok: true, item: res };
  }
}
