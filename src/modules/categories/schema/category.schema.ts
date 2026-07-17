import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true, index: true })
  name!: string;

  @Prop({ type: String, default: null })
  description!: string | null;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
