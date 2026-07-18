/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import {
  Notification,
  NotificationDocument,
} from '../../notifications/schema/notification.schema';
import {
  PackageItem,
  PackageDocument,
} from '../../packages/schema/package.schema';
import {
  Session,
  SessionDocument,
  SessionStatus,
} from '../../sessions/schema/session.schema';
import {
  TeacherProfile,
  TeacherProfileDocument,
} from '../../teachers/schema/teacher-profile.schema';
import { User, UserDocument } from '../../users/schema/user.schema';
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
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
  ) {}

  private buildDashboardShape(
    profile: Record<string, unknown> | null,
    user: Record<string, unknown> | null,
    recentBookings: Array<Record<string, unknown>>,
    recommendedTeachers: Array<Record<string, unknown>>,
    upcomingSessions: Array<Record<string, unknown>>,
    stats: {
      totalTeachers: number;
      totalBookings: number;
      activePackages: number;
      completedSessions: number;
      upcomingSessions: number;
      unreadNotifications: number;
    },
  ) {
    return {
      message: 'Success',
      data: {
        profile: {
          ...(profile ?? {}),
          user,
        },
        stats,
        recentBookings,
        recommendedTeachers,
        upcomingSessions,
      },
    };
  }

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

  async getDashboard(userId: string): Promise<{
    message: string;
    data: {
      profile: Record<string, unknown>;
      stats: {
        totalTeachers: number;
        totalBookings: number;
        activePackages: number;
        completedSessions: number;
        upcomingSessions: number;
        unreadNotifications: number;
      };
      recentBookings: Array<Record<string, unknown>>;
      recommendedTeachers: Array<Record<string, unknown>>;
      upcomingSessions: Array<Record<string, unknown>>;
    };
  }> {
    const profile = await this.studentProfileModel
      .findOne({ userId })
      .lean()
      .exec();
    const user = await this.userModel.findById(userId).lean().exec();
    const recentBookings = await this.bookingModel
      .find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .exec();
    const recommendedTeachers = await this.teacherProfileModel
      .find()
      .sort({ rating: -1, totalReviews: -1 })
      .limit(5)
      .lean()
      .exec();
    const upcomingSessions = await this.sessionModel
      .find({
        studentId: userId,
        status: { $in: [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS] },
      })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .lean()
      .exec();

    const totalTeachers = await this.teacherProfileModel.countDocuments();
    const totalBookings = await this.bookingModel.countDocuments({
      studentId: userId,
    });
    const activePackages = await this.packageModel.countDocuments({
      isActive: true,
    });
    const completedSessions = await this.sessionModel.countDocuments({
      studentId: userId,
      status: SessionStatus.COMPLETED,
    });
    const unreadNotifications = await this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });

    const enrichedTeachers = await Promise.all(
      recommendedTeachers.map(async (teacher) => {
        const teacherUser = await this.userModel
          .findById(teacher.userId)
          .lean()
          .exec();

        return {
          ...teacher,
          user: teacherUser,
        };
      }),
    );

    const recentBookingsWithTeacher = await Promise.all(
      recentBookings.map(async (booking) => {
        const teacher = await this.userModel
          .findById(booking.teacherId)
          .lean()
          .exec();

        return {
          ...booking,
          teacher,
        };
      }),
    );

    return this.buildDashboardShape(
      profile as Record<string, unknown> | null,
      user as Record<string, unknown> | null,
      recentBookingsWithTeacher as Array<Record<string, unknown>>,
      enrichedTeachers as Array<Record<string, unknown>>,
      upcomingSessions as Array<Record<string, unknown>>,
      {
        totalTeachers,
        totalBookings,
        activePackages,
        completedSessions,
        upcomingSessions: upcomingSessions.length,
        unreadNotifications,
      },
    );
  }
}
