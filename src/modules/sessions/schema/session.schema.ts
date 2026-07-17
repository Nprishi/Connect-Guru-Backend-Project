import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, index: true })
  bookingId!: string;

  @Prop({ required: true, index: true })
  studentId!: string;

  @Prop({ required: true, index: true })
  teacherId!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true, type: Date })
  scheduledAt!: Date;

  @Prop({ type: String, enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status!: SessionStatus;

  @Prop({ type: Date, default: null })
  startedAt!: Date | null;

  @Prop({ type: Date, default: null })
  endedAt!: Date | null;

  @Prop({ type: String, default: null })
  notes!: string | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
