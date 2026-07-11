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
    });

    return user.save();
  }

  async findByEmail(
    email: string,
    includePassword = false,
    includeSuperAdminSecret = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase() });

    if (includePassword) {
      query.select('+password');
    }

    if (includeSuperAdminSecret) {
      query.select('+superAdminSecret');
    }

    return query.exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findById(
    id: string,
    includeRefreshToken = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findById(id);

    if (includeRefreshToken) {
      query.select('+refreshToken');
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
}
