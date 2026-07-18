import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemSettingsDocument = HydratedDocument<SystemSettings>;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ required: true, trim: true, default: 'Connect Guru' })
  platformName!: string;

  @Prop({ required: true, trim: true, default: 'support@connectguru.com' })
  supportEmail!: string;

  @Prop({ type: Boolean, default: false })
  maintenanceMode!: boolean;

  @Prop({ type: Boolean, default: true })
  registrationEnabled!: boolean;

  @Prop({ type: Number, default: 10 })
  commissionPercentage!: number;

  @Prop({ type: String, default: 'USD' })
  defaultCurrency!: string;

  @Prop({ type: String, default: 'UTC' })
  timezone!: string;

  @Prop({ type: String, default: null })
  smtpHost!: string | null;

  @Prop({ type: Number, default: null })
  smtpPort!: number | null;

  @Prop({ type: String, default: null })
  smtpUser!: string | null;

  @Prop({ type: String, default: null })
  smtpPassword!: string | null;

  @Prop({ type: String, default: null })
  cloudinaryCloudName!: string | null;

  @Prop({ type: String, default: null })
  cloudinaryApiKey!: string | null;

  @Prop({ type: String, default: null })
  cloudinaryApiSecret!: string | null;

  @Prop({ type: String, default: '127.0.0.1' })
  redisHost!: string;

  @Prop({ type: Number, default: 6379 })
  redisPort!: number;

  @Prop({ type: String, default: null })
  redisPassword!: string | null;

  @Prop({ type: String, default: '15m' })
  jwtAccessTokenExpiry!: string;

  @Prop({ type: String, default: '7d' })
  jwtRefreshTokenExpiry!: string;
}

export const SystemSettingsSchema =
  SchemaFactory.createForClass(SystemSettings);
