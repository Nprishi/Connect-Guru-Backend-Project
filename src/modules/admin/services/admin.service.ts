import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../users/schema/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getDashboard() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'active' }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingReviews: 0,
    };
  }

  async getUsers() {
    return this.userModel.find().select('-password -refreshToken').exec();
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.status = status as typeof user.status;
    return user.save();
  }
}
