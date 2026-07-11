import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KycDocument = HydratedDocument<Kyc>;

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Kyc {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ required: true })
  documentType!: string;

  @Prop({ required: true })
  documentUrl!: string;

  @Prop({ type: String, enum: KycStatus, default: KycStatus.PENDING })
  status!: KycStatus;

  @Prop({ type: String, default: null })
  adminNote!: string | null;
}

export const KycSchema = SchemaFactory.createForClass(Kyc);
