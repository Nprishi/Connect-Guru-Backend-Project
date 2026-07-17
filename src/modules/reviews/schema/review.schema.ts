import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, index: true })
  teacherId!: string;

  @Prop({ required: true, index: true })
  studentId!: string;

  @Prop({ required: true, min: 1, max: 5, type: Number })
  rating!: number;

  @Prop({ type: String, default: null })
  comment!: string | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
