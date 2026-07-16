import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import { CreateTeacherProfileDto } from '../dto/create-teacher-profile.dto';
import {
  TeacherProfile,
  TeacherProfileDocument,
} from '../schema/teacher-profile.schema';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createOrUpdateProfile(userId: string, dto: CreateTeacherProfileDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const existingProfile = await this.teacherProfileModel.findOne({ userId });

    if (existingProfile) {
      return this.teacherProfileModel.findOneAndUpdate(
        { userId },
        { $set: dto },
        { new: true },
      );
    }

    return this.teacherProfileModel.create({ userId, ...dto });
  }

  async updateProfile(userId: string, payload: Record<string, unknown>) {
    const profile = await this.teacherProfileModel.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    return profile;
  }

  async updateAvailability(userId: string, availability: string[]) {
    const profile = await this.teacherProfileModel.findOneAndUpdate(
      { userId },
      { $set: { availability } },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    return profile;
  }

  async getMe(userId: string) {
    return this.getProfile(userId);
  }

  async getProfile(userId: string) {
    const profile = await this.teacherProfileModel.findOne({ userId });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    const user = await this.usersService.findById(userId);

    return {
      profile,
      user,
    };
  }

  async getDashboard(userId: string) {
    const profile = await this.teacherProfileModel.findOne({ userId });
    const bookings = await this.bookingModel
      .find({ teacherId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return {
      profile,
      bookings,
      stats: {
        totalBookings: await this.bookingModel.countDocuments({ teacherId: userId }),
        activeStudents: await this.bookingModel.distinct('studentId', { teacherId: userId }).then((items) => items.length),
      },
    };
  }

  async getStudents(userId: string) {
    const bookings = await this.bookingModel.find({ teacherId: userId }).exec();
    const studentIds = [...new Set(bookings.map((booking) => booking.studentId))];

    return Promise.all(
      studentIds.map(async (studentId) => {
        const user = await this.usersService.findById(studentId);
        return { studentId, user };
      }),
    );
  }

  async getReviews(userId: string) {
    return this.bookingModel
      .find({ teacherId: userId })
      .select('studentId notes status')
      .lean()
      .exec();
  }

  async searchTeachers(query: {
    subject?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.subject) {
      filter.subjects = { $in: [new RegExp(query.subject, 'i')] };
    }

    const sort: Record<string, SortOrder> = {
      createdAt: -1,
    };

    const profiles = await this.teacherProfileModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const teachers = await Promise.all(
      profiles.map(async (profile) => {
        const user = await this.usersService.findById(profile.userId);

        return {
          profile,
          user,
        };
      }),
    );

    return {
      teachers,
      page,
      limit,
    };
  }
}
