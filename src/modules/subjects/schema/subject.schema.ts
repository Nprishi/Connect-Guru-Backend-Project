import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubjectDocument = HydratedDocument<SubjectItem>;

@Schema({ timestamps: true })
export class SubjectItem {
  @Prop({ required: true, trim: true, unique: true, index: true })
  name!: string;

  @Prop({ type: String, default: null })
  description!: string | null;

  @Prop({ required: true, index: true })
  categoryId!: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(SubjectItem);
