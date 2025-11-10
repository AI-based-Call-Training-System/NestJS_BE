import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection:"EvalResults",timestamps: true })
export class EvalResult extends Document {
  @Prop({ required: true, unique:true})
  session_id: string;

  @Prop({ type: Array })
  scores: {
    title: string;
    score: number;
    comment: string;
  }[];
}

export const EvalResultSchema = SchemaFactory.createForClass(EvalResult);
