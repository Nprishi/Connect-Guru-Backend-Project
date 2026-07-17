import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import { PackageItem, PackageDocument } from '../../packages/schema/package.schema';
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../schema/student-profile.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(PackageItem.name)
    private readonly packageModel: Model<PackageDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createOrUpdateProfile(userId: string, dto: CreateStudentProfileDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const existingProfile = await this.studentProfileModel.findOne({ userId });

    if (existingProfile) {
      return this.studentProfileModel.findOneAndUpdate(
        { userId },
        { $set: dto },
        { new: true },
      );
    }

    return this.studentProfileModel.create({ userId, ...dto });
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const profile = await this.studentProfileModel.findOneAndUpdate(
      { userId },
      { $set: dto },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('Student profile not found.');
    }

    return profile;
  }

  async getMe(userId: string) {
    return this.getProfile(userId);
  }

  async getProfile(userId: string) {
    const profile = await this.studentProfileModel.findOne({ userId });

    if (!profile) {
      throw new NotFoundException('Student profile not found.');
    }

    const user = await this.usersService.findById(userId);

    return {
      profile,
      user,
    };
  }

  async getDashboard(userId: string) {
    const profile = await this.studentProfileModel.findOne({ userId });
    const bookings = await this.bookingModel
      .find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return {
      profile,
      bookings,
      stats: {
        totalBookings: await this.bookingModel.countDocuments({ studentId: userId }),
        activePackages: await this.packageModel.countDocuments({ teacherId: { $exists: true } }),
      },
    };
  }
}
