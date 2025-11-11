import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EvalResult extends Document {
  @Prop({ required: true, unique: true })
  session_id: string;

  @Prop({
    type: [
      {
        title: { type: String },
        score: { type: Number },
        comment: { type: String },
      },
    ],
  })
  scores: {
    title: string;
    score: number;
    comment: string;
  }[];

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const EvalResultSchema = SchemaFactory.createForClass(EvalResult);
