import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BackupDocument = HydratedDocument<BackupRecord>;

@Schema({ timestamps: true })
export class BackupRecord {
  @Prop({ required: true, unique: true, trim: true, index: true })
  backupId!: string;

  @Prop({ required: true, trim: true, index: true })
  filename!: string;

  @Prop({ required: true, trim: true })
  path!: string;

  @Prop({ required: true, trim: true })
  databaseName!: string;

  @Prop({ type: String, default: 'completed' })
  status!: string;

  @Prop({ type: Number, default: 0 })
  sizeInBytes!: number;

  @Prop({ required: true, trim: true })
  createdBy!: string;
}

export const BackupSchema = SchemaFactory.createForClass(BackupRecord);
