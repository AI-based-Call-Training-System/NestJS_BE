import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Session, SessionDocument } from './history.schema';
import { QueryHistoryDto } from './dto/query-history.dto';

type HistoryItem = { role: string; content: string; timestamp: Date | string };
type AggregateRow = { userId: string; total: number; history: HistoryItem[] };

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async getHistoryByUserId(
    userId: string,
    dto: QueryHistoryDto,
  ): Promise<{
    ok: true;
    userId: string;
    total: number;
    skip: number;
    limit: number;
    items: HistoryItem[];
  }> {
    const { from, to, role, skip = 0, limit = 50, q } = dto;

    const matchStage: PipelineStage.Match = { $match: { userId } };

    const castStage: PipelineStage.AddFields = {
      $addFields: {
        _hist: {
          $map: {
            input: '$history',
            as: 'h',
            in: {
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

    const filterConds: Record<string, unknown>[] = [];
    if (from) filterConds.push({ $gte: ['$$h.ts', new Date(from)] });
    if (to) filterConds.push({ $lte: ['$$h.ts', new Date(to)] });
    if (role) filterConds.push({ $eq: ['$$h.role', role] });
    if (q)
      filterConds.push({
        $regexMatch: { input: '$$h.content', regex: q, options: 'i' },
      });

    let projectStage: PipelineStage.Project;
    if (filterConds.length === 0) {
      projectStage = {
        $project: {
          _id: 0,
          userId: 1,
          total: { $size: '$_hist' },
          history: {
            $slice: [
              { $sortArray: { input: '$_hist', sortBy: { ts: -1 } } },
              skip,
              limit,
            ],
          },
        },
      };
    } else {
      projectStage = {
        $project: {
          _id: 0,
          userId: 1,
          _filtered: {
            $filter: {
              input: '$_hist',
              as: 'h',
              cond:
                filterConds.length === 1
                  ? filterConds[0]
                  : { $and: filterConds },
            },
          },
        },
      };
    }

    const pipeline: PipelineStage[] = [matchStage, castStage, projectStage];

    if (filterConds.length > 0) {
      pipeline.push(
        {
          $addFields: {
            _sorted: {
              $sortArray: { input: '$_filtered', sortBy: { ts: -1 } },
            },
          },
        },
        {
          $project: {
            userId: 1,
            total: { $size: '$_filtered' },
            history: { $slice: ['$_sorted', skip, limit] },
          },
        },
      );
    }

    const out = await this.sessionModel
      .aggregate<AggregateRow>(pipeline)
      .exec();
    if (!out || out.length === 0) {
      return { ok: true, userId, total: 0, skip, limit, items: [] };
    }
    return {
      ok: true,
      userId,
      total: out[0].total,
      skip,
      limit,
      items: out[0].history,
    };
  }
}
