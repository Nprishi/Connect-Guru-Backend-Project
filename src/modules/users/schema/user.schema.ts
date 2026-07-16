import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Gender } from '../../auth/enums/gender.enum';
import { UserRole } from '../../auth/enums/user-role.enum';
import { UserStatus } from '../../auth/enums/user-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  firstName!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  lastName!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
    select: false,
  })
  password!: string;

  @Prop({
    type: String,
    required: true,
    enum: UserRole,
  })
  role!: UserRole;

  @Prop({
    type: String,
    required: true,
    enum: Gender,
  })
  gender!: Gender;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  phone!: string;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Prop({
    type: String,
    default: null,
  })
  avatar!: string | null;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  superAdminSecret!: string | null;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  refreshToken!: string | null;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  resetPasswordToken!: string | null;

  @Prop({
    type: Date,
    default: null,
  })
  resetPasswordExpiresAt!: Date | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  isEmailVerified!: boolean;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  emailVerificationOtpHash!: string | null;

  @Prop({
    type: Date,
    default: null,
  })
  emailVerificationOtpExpiresAt!: Date | null;

  @Prop({
    type: Number,
    default: 0,
  })
  emailVerificationAttempts!: number;

  @Prop({
    type: Date,
    default: null,
  })
  emailVerificationLastSentAt!: Date | null;

  @Prop({
    type: Object,
    default: {
      notifications: true,
      emailUpdates: true,
    },
  })
  settings!: {
    notifications?: boolean;
    emailUpdates?: boolean;
  };

  @Prop({
    type: Date,
    default: null,
  })
  lastLogin!: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
