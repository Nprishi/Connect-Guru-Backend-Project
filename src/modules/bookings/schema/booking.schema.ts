import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, index: true })
  studentId!: string;

  @Prop({ required: true, index: true })
  teacherId!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Prop({ type: Number, default: 0 })
  hourlyRate!: number;

  @Prop({ type: String, default: null })
  notes!: string | null;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
