import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PackageDocument = HydratedDocument<PackageItem>;

@Schema({ timestamps: true })
export class PackageItem {
  @Prop({ required: true, index: true })
  teacherId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Number, required: true })
  price!: number;

  @Prop({ type: Number, default: 1 })
  durationInHours!: number;

  @Prop({ type: Number, default: 0 })
  sessions!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(PackageItem);
