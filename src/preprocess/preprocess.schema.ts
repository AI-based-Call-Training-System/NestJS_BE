import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PreprocessDocument = Preprocess & Document;

@Schema()
export class Preprocess {
  @Prop()
  session_id: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  messageCount: number;

  @Prop({ type: Object })
  goalSpec: Record<string, any>;

  @Prop({ type: Array })
  history: any[];

  @Prop({ type: Object })
  labels: Record<string, any>;

  @Prop({ type: Object })
  meta: Record<string, any>;
}

export const PreprocessSchema = SchemaFactory.createForClass(Preprocess);
