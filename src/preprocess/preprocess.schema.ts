import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PreprocessDocument = Preprocess & Document;

@Schema({collection: 'Preprocesses'})
export class Preprocess {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  preprocessId: string;

  @Prop({ type: Object, required: true })
  view: Record<string, any>;

  @Prop({ type: Array })
  windows?: Array<{ text: string }>;

  @Prop({ type: Object })
  linearized?: Record<string, any>;

  @Prop({ type: Array })
  history?: Array<any>;

  @Prop({ type: Object })
  goalSpec?: Record<string, any>;

  @Prop({ type: Object })
  labels?: Record<string, any>;

  @Prop({ type: Object })
  meta?: Record<string, any>;

  @Prop({ type: Array })
  tags?: string[];

  @Prop()
  messageCount?: number;
}

export const PreprocessSchema = SchemaFactory.createForClass(Preprocess);
