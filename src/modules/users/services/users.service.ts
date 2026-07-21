import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel({
      ...createUserDto,
      email: createUserDto.email?.toLowerCase(),
      settings: {
        notifications: true,
        emailUpdates: true,
      },
    });

    return user.save();
  }

  async findByEmail(
    email: string,
    includePassword = false,
    includeSuperAdminSecret = false,
    includeSensitiveOtp = false,
    includeResetToken = false,
    includeDeleted = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({
      email: email.toLowerCase(),
      ...(includeDeleted ? {} : { isDeleted: false }),
    });

    if (includePassword) {
      query.select('+password');
    }

    if (includeSuperAdminSecret) {
      query.select('+superAdminSecret');
    }

    if (includeSensitiveOtp) {
      query.select('+emailVerificationOtpHash');
    }

    if (includeResetToken) {
      query.select('+resetPasswordToken');
    }

    return query.exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findById(
    id: string,
    includeRefreshToken = false,
    includeSensitiveOtp = false,
    includeResetToken = false,
    includeDeleted = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({
      _id: id,
      ...(includeDeleted ? {} : { isDeleted: false }),
    });

    if (includeRefreshToken) {
      query.select('+refreshToken');
    }

    if (includeSensitiveOtp) {
      query.select('+emailVerificationOtpHash');
    }

    if (includeResetToken) {
      query.select('+resetPasswordToken');
    }

    return query.exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastLogin: new Date() })
      .exec();
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password }).exec();
  }

  async updateSuperAdminSecret(
    userId: string,
    superAdminSecret: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { superAdminSecret }).exec();
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { avatar: avatarUrl })
      .exec();
  }

  async removeAvatar(userId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { avatar: null },
      { new: true },
    );
  }

  async getProfile(userId: string) {
    return this.userModel
      .findById(userId)
      .select(
        '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
      )
      .lean()
      .exec();
  }

  async updateProfile(userId: string, updateData: Record<string, unknown>) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            ...updateData,
          },
        },
        { new: true },
      )
      .select(
        '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
      )
      .exec();
  }

  async getSettings(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('settings')
      .lean()
      .exec();
    return user?.settings ?? { notifications: true, emailUpdates: true };
  }

  async updateSettings(userId: string, settings: Record<string, unknown>) {
    return this.userModel
      .findByIdAndUpdate(userId, { $set: { settings } }, { new: true })
      .select('settings')
      .exec();
  }

  async deleteAccount(userId: string) {
    await this.userModel.findByIdAndDelete(userId).exec();
    return { success: true, message: 'Account deleted successfully.' };
  }

  async updateEmailVerificationTokens(
    userId: string,
    otpHash: string | null,
    otpExpiresAt: Date | null,
    lastSentAt: Date | null,
  ) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        emailVerificationOtpHash: otpHash,
        emailVerificationOtpExpiresAt: otpExpiresAt,
        emailVerificationLastSentAt: lastSentAt,
      })
      .exec();
  }

  async markEmailVerified(userId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        isEmailVerified: true,
        emailVerificationOtpHash: null,
        emailVerificationOtpExpiresAt: null,
        emailVerificationAttempts: 0,
      })
      .exec();
  }

  async setResetPasswordToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      })
      .exec();
  }
}
