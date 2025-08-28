import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ collection: 'Sessions', timestamps: true })
export class Session {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({
    type: [
      {
        role: { type: String, required: true }, // 'user' | 'gemini' | ...
        content: { type: String, required: true },
        timestamp: { type: Date, required: true },
      },
    ],
    default: [],
  })
  history: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// 조회 성능을 위해 간단한 인덱스
SessionSchema.index({ userId: 1 });
SessionSchema.index({ 'history.timestamp': -1 });
