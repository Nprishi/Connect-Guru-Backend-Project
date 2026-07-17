import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  USER_REGISTERED = 'user_registered',
  USER_LOGGED_IN = 'user_logged_in',
  BOOKING_CREATED = 'booking_created',
  BOOKING_ACCEPTED = 'booking_accepted',
  BOOKING_REJECTED = 'booking_rejected',
  PACKAGE_PURCHASED = 'package_purchased',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  PAYMENT_COMPLETED = 'payment_completed',
  KYC_APPROVED = 'kyc_approved',
  ADMIN_ANNOUNCEMENT = 'admin_announcement',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ type: String, enum: NotificationType, required: true, index: true })
  type!: NotificationType;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ type: Boolean, default: false, index: true })
  isRead!: boolean;

  @Prop({ type: String, default: null })
  link!: string | null;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
