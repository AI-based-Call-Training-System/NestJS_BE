// src/preprocess/preprocess.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PreprocessDocument = Preprocess & Document;

@Schema({ timestamps: true })
export class Preprocess {
  @Prop({ required: true })
  session_id: string;

  @Prop({ type: Array, default: [] })
  tags: string[];

  @Prop()
  messageCount: number;

  @Prop({ type: Object })
  goalSpec: any;

  @Prop({ type: Array })
  history: any[];

  @Prop({ type: Object })
  labels: any;

  @Prop({ type: Object })
  meta: any;
}

export const PreprocessSchema = SchemaFactory.createForClass(Preprocess);
