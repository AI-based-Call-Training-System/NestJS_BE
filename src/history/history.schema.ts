import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ collection: 'Sessions', timestamps: true })
// 세션 메타 데이터
export class Session {
  @Prop({ required: true, index: true })
  userId: string; // 사용자 ID

  @Prop({ required: true, index: true })
  sessionId: string; // 세션 ID

  @Prop({ default: '' })
  title: string; // 대화 제목

  @Prop({ type: [String], default: [], index: true })
  tags: string[]; // 주제 태그

  @Prop({ default: false, index: true })
  archived: boolean; // 보관 여부

  @Prop({ default: false, index: true })
  bookmark: boolean; // 즐겨찾기 여부

  @Prop({ type: Boolean, default: null, index: true })
  success?: boolean | null; // 성공 여부

  @Prop({ default: 0 })
  messageCount: number; // 메세지 개수

  @Prop({ type: Date, index: true })
  lastMessageAt?: Date; // 마지막 메시지 시간

  @Prop({
    // 메세지 히스토리
    type: [
      {
        messageId: { type: String, required: true }, // 메세지 ID
        seq: { type: Number, required: true }, // 메세지 순서
        role: { type: String, required: true }, // 메세지 발신자
        content: { type: String, required: true }, // 메세지 내용
        timestamp: { type: Date, required: true }, // 메세지 타임스탬프
      },
    ],
    default: [],
  })
  history: {
    messageId: string;
    seq: number;
    role: string;
    content: string;
    timestamp: Date;
  }[];
}

// 세션 스키마 생성
export const SessionSchema = SchemaFactory.createForClass(Session);

// 인덱스
SessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
SessionSchema.index({ userId: 1, lastMessageAt: -1 });
SessionSchema.index({ 'history.timestamp': -1 });

// 텍스트 검색용 인덱스
SessionSchema.index(
  { title: 'text', 'history.content': 'text' },
  { weights: { title: 5, 'history.content': 1 }, name: 'SessionsTextIndex' },
);
