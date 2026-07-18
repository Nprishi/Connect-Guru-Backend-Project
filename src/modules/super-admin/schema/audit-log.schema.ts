import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

export enum AuditAction {
  ADMIN_LOGIN = 'admin_login',
  ADMIN_LOGOUT = 'admin_logout',
  ADMIN_CREATED = 'admin_created',
  ADMIN_UPDATED = 'admin_updated',
  ADMIN_DELETED = 'admin_deleted',
  PLATFORM_SETTINGS_UPDATED = 'platform_settings_updated',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true, index: true })
  adminId!: string;

  @Prop({ required: true, trim: true, index: true })
  adminEmail!: string;

  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action!: AuditAction;

  @Prop({ type: Object, default: {} })
  details!: Record<string, unknown>;

  @Prop({ type: String, default: null, index: true })
  ipAddress!: string | null;

  @Prop({ type: String, default: null, index: true })
  userAgent!: string | null;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
