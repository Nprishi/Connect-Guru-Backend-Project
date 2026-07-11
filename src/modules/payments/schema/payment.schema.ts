import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, index: true })
  studentId!: string;

  @Prop({ required: true, index: true })
  teacherId!: string;

  @Prop({ required: true })
  packageId!: string;

  @Prop({ required: true, type: Number })
  amount!: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Prop({ type: String, default: null })
  transactionId!: string | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
