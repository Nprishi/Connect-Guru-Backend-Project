import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import { Kyc, KycDocument, KycStatus } from '../../kyc/schema/kyc.schema';
import { User, UserDocument } from '../../users/schema/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Kyc.name) private readonly kycModel: Model<KycDocument>,
  ) {}

  async getDashboard() {
    const [totalUsers, activeUsers, pendingBookings, pendingKyc] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'active' }),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.kycModel.countDocuments({ status: KycStatus.PENDING }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingBookings,
      pendingKyc,
      pendingReviews: pendingKyc,
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
