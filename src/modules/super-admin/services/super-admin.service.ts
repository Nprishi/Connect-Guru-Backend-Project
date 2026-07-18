/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import path from 'path';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../../bookings/schema/booking.schema';
import {
  Category,
  CategoryDocument,
} from '../../categories/schema/category.schema';
import { Kyc, KycDocument, KycStatus } from '../../kyc/schema/kyc.schema';
import { NotificationType } from '../../notifications/schema/notification.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../../payments/schema/payment.schema';
import { Session, SessionDocument } from '../../sessions/schema/session.schema';
import {
  SubjectItem,
  SubjectDocument,
} from '../../subjects/schema/subject.schema';
import { User, UserDocument } from '../../users/schema/user.schema';
import {
  AuditAction,
  AuditLog,
  AuditLogDocument,
} from '../schema/audit-log.schema';
import { BackupRecord, BackupDocument } from '../schema/backup.schema';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../schema/system-settings.schema';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { CreateAnnouncementDto } from '../dto/announcement.dto';
import { SystemSettingsDto } from '../dto/system-settings.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { UserRole } from '../../auth/enums/user-role.enum';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { Gender } from '../../auth/enums/gender.enum';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Kyc.name)
    private readonly kycModel: Model<KycDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubjectItem.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(SystemSettings.name)
    private readonly systemSettingsModel: Model<SystemSettingsDocument>,
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    @InjectModel(BackupRecord.name)
    private readonly backupModel: Model<BackupDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async getDashboard() {
    const [
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      suspendedAdmins,
      totalTeachers,
      totalStudents,
      totalUsers,
      totalBookings,
      totalPayments,
      completedPayments,
      failedPayments,
      refundedPayments,
      totalRevenue,
      totalCategories,
      totalSubjects,
      pendingKyc,
      activeSessions,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.ADMIN, isDeleted: false }),
      this.userModel.countDocuments({
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isDeleted: false,
      }),
      this.userModel.countDocuments({
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE,
        isDeleted: false,
      }),
      this.userModel.countDocuments({
        role: UserRole.ADMIN,
        status: UserStatus.SUSPENDED,
        isDeleted: false,
      }),
      this.userModel.countDocuments({
        role: UserRole.TEACHER,
        isDeleted: false,
      }),
      this.userModel.countDocuments({
        role: UserRole.STUDENT,
        isDeleted: false,
      }),
      this.userModel.countDocuments({
        role: { $ne: UserRole.SUPER_ADMIN },
        isDeleted: false,
      }),
      this.bookingModel.countDocuments(),
      this.paymentModel.countDocuments(),
      this.paymentModel.countDocuments({ status: PaymentStatus.COMPLETED }),
      this.paymentModel.countDocuments({ status: PaymentStatus.FAILED }),
      this.paymentModel.countDocuments({ status: PaymentStatus.REFUNDED }),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.COMPLETED } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      this.categoryModel.countDocuments(),
      this.subjectModel.countDocuments(),
      this.kycModel.countDocuments({ status: KycStatus.PENDING }),
      this.sessionModel.countDocuments({
        status: { $in: ['scheduled', 'in_progress'] },
      }),
    ]);

    return {
      success: true,
      message: 'Super Admin dashboard fetched successfully.',
      data: {
        Admins: {
          totalAdmins,
          activeAdmins,
          inactiveAdmins,
          suspendedAdmins,
        },
        Users: {
          totalUsers,
          totalTeachers,
          totalStudents,
        },
        Business: {
          totalBookings,
          totalPayments,
          completedPayments,
          failedPayments,
          refundedPayments,
          totalRevenue: totalRevenue[0]?.totalRevenue ?? 0,
        },
        Platform: {
          totalCategories,
          totalSubjects,
          pendingKyc,
          activeSessions,
        },
      },
    };
  }

  async getAdmins(queryDto: AdminQueryDto) {
    const page = Number(queryDto.page ?? 1);
    const limit = Number(queryDto.limit ?? 10);
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;
    const search = (queryDto.search ?? '').trim();
    const sortBy = this.getSafeSortField(queryDto.sortBy ?? 'createdAt');

    const filter: Record<string, unknown> = {
      role: UserRole.ADMIN,
      isDeleted: false,
    };

    if (queryDto.status) {
      filter.status = queryDto.status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(
          '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
        )
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      success: true,
      message: 'Admins fetched successfully.',
      data: {
        items,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async createAdmin(actorId: string, dto: CreateAdminDto) {
    this.assertValidObjectId(actorId, 'Actor id');

    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = String(dto.phone ?? '').trim();

    const [emailExists, phoneExists] = await Promise.all([
      this.userModel
        .findOne({ email: normalizedEmail, isDeleted: false })
        .lean()
        .exec(),
      this.userModel
        .findOne({ phone: normalizedPhone, isDeleted: false })
        .lean()
        .exec(),
    ]);

    if (emailExists) {
      throw new ConflictException('Admin email already exists.');
    }

    if (phoneExists) {
      throw new ConflictException('Admin phone number already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdAdmin = await this.userModel.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      gender: dto.gender ?? Gender.MALE,
      phone: normalizedPhone,
      status: dto.status ?? UserStatus.ACTIVE,
      settings: {
        notifications: true,
        emailUpdates: true,
      },
      isDeleted: false,
      deletedAt: null,
    });

    await this.logAuditAction({
      adminId: actorId,
      adminEmail: (await this.getActorEmail(actorId)) ?? 'unknown',
      action: AuditAction.ADMIN_CREATED,
      details: {
        createdAdminId: createdAdmin.id,
        createdAdminEmail: normalizedEmail,
      },
    });

    return {
      success: true,
      message: 'Admin created successfully.',
      data: this.sanitizeAdmin(createdAdmin),
    };
  }

  async getAdminById(adminId: string) {
    this.assertValidObjectId(adminId, 'Admin id');

    const admin = await this.userModel
      .findOne({ _id: adminId, role: UserRole.ADMIN, isDeleted: false })
      .select(
        '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
      )
      .lean()
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    return {
      success: true,
      message: 'Admin profile fetched successfully.',
      data: admin,
    };
  }

  async updateAdmin(actorId: string, adminId: string, dto: UpdateAdminDto) {
    this.assertValidObjectId(actorId, 'Actor id');
    this.assertValidObjectId(adminId, 'Admin id');

    const existingAdmin = await this.userModel
      .findOne({ _id: adminId, role: UserRole.ADMIN, isDeleted: false })
      .exec();

    if (!existingAdmin) {
      throw new NotFoundException('Admin not found.');
    }

    if (dto.phone) {
      const normalizedPhone = String(dto.phone).trim();
      const duplicatePhone = await this.userModel
        .findOne({
          phone: normalizedPhone,
          _id: { $ne: adminId },
          isDeleted: false,
        })
        .lean()
        .exec();

      if (duplicatePhone) {
        throw new ConflictException('Admin phone number already exists.');
      }
    }

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.firstName) updateData.firstName = dto.firstName.trim();
    if (dto.lastName) updateData.lastName = dto.lastName.trim();
    if (dto.phone) updateData.phone = String(dto.phone).trim();

    const updatedAdmin = await this.userModel
      .findByIdAndUpdate(adminId, { $set: updateData }, { new: true })
      .select(
        '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
      )
      .lean()
      .exec();

    await this.logAuditAction({
      adminId: actorId,
      adminEmail: (await this.getActorEmail(actorId)) ?? 'unknown',
      action: AuditAction.ADMIN_UPDATED,
      details: {
        targetAdminId: adminId,
        updatedFields: Object.keys(dto),
      },
    });

    return {
      success: true,
      message: 'Admin updated successfully.',
      data: updatedAdmin,
    };
  }

  async deleteAdmin(actorId: string, adminId: string) {
    this.assertValidObjectId(actorId, 'Actor id');
    this.assertValidObjectId(adminId, 'Admin id');

    const admin = await this.userModel
      .findOne({ _id: adminId, role: UserRole.ADMIN, isDeleted: false })
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    await this.userModel.findByIdAndUpdate(adminId, {
      $set: {
        status: UserStatus.SUSPENDED,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await this.logAuditAction({
      adminId: actorId,
      adminEmail: (await this.getActorEmail(actorId)) ?? 'unknown',
      action: AuditAction.ADMIN_DELETED,
      details: {
        deletedAdminId: adminId,
        deletedAdminEmail: admin.email,
      },
    });

    return {
      success: true,
      message: 'Admin deleted successfully.',
      data: null,
    };
  }

  async getAnalytics() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const startOfLast12Months = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
      0,
      0,
      0,
      0,
    );

    const [
      monthlyRevenue,
      yearlyRevenue,
      usersGrowth,
      teachersGrowth,
      studentsGrowth,
      bookingsGrowth,
      paymentsGrowth,
      topCategories,
      topSubjects,
      topTeachers,
    ] = await Promise.all([
      this.paymentModel.aggregate([
        {
          $match: {
            status: PaymentStatus.COMPLETED,
            createdAt: { $gte: startOfLast12Months },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            totalRevenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: PaymentStatus.COMPLETED,
            createdAt: { $gte: startOfYear },
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      this.buildMonthlyCountSeries(
        this.userModel,
        { role: { $ne: UserRole.SUPER_ADMIN }, isDeleted: false },
        'users',
      ),
      this.buildMonthlyCountSeries(
        this.userModel,
        { role: UserRole.TEACHER, isDeleted: false },
        'teachers',
      ),
      this.buildMonthlyCountSeries(
        this.userModel,
        { role: UserRole.STUDENT, isDeleted: false },
        'students',
      ),
      this.buildMonthlyCountSeries(this.bookingModel, {}, 'bookings'),
      this.buildMonthlyCountSeries(
        this.paymentModel,
        { status: PaymentStatus.COMPLETED },
        'payments',
      ),
      this.categoryModel.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
      this.subjectModel.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
      this.getTopTeachers(),
    ]);

    return {
      success: true,
      message: 'Platform analytics fetched successfully.',
      data: {
        Revenue: {
          monthlyRevenue,
          yearlyRevenue: yearlyRevenue[0]?.totalRevenue ?? 0,
        },
        UsersGrowth: usersGrowth,
        TeachersGrowth: teachersGrowth,
        StudentsGrowth: studentsGrowth,
        BookingsGrowth: bookingsGrowth,
        PaymentsGrowth: paymentsGrowth,
        TopCategories: topCategories,
        TopSubjects: topSubjects,
        TopTeachers: topTeachers,
      },
    };
  }

  async getSystemSettings() {
    const settings = await this.systemSettingsModel.findOne().lean().exec();

    if (!settings) {
      const created = await this.systemSettingsModel.create({});
      return {
        success: true,
        message: 'System settings fetched successfully.',
        data: created.toObject(),
      };
    }

    return {
      success: true,
      message: 'System settings fetched successfully.',
      data: settings,
    };
  }

  async updateSystemSettings(actorId: string, dto: SystemSettingsDto) {
    this.assertValidObjectId(actorId, 'Actor id');

    const updatedSettings = await this.systemSettingsModel
      .findOneAndUpdate(
        {},
        { $set: dto },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    await this.logAuditAction({
      adminId: actorId,
      adminEmail: (await this.getActorEmail(actorId)) ?? 'unknown',
      action: AuditAction.PLATFORM_SETTINGS_UPDATED,
      details: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      success: true,
      message: 'System settings updated successfully.',
      data: updatedSettings,
    };
  }

  async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    adminId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);
    const search = (filters.search ?? '').trim();

    const query: Record<string, unknown> = {};

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.adminId) {
      this.assertValidObjectId(filters.adminId, 'Admin id filter');
      query.adminId = filters.adminId;
    }

    if (filters.fromDate || filters.toDate) {
      const createdAtQuery: Record<string, Date> = {};
      if (filters.fromDate) {
        createdAtQuery.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        createdAtQuery.$lte = new Date(filters.toDate);
      }
      query.createdAt = createdAtQuery;
    }

    if (search) {
      query.$or = [
        { adminEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(query),
    ]);

    return {
      success: true,
      message: 'Audit logs fetched successfully.',
      data: {
        items,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async createBackup(actorId: string) {
    this.assertValidObjectId(actorId, 'Actor id');

    const uri =
      this.configService.get<string>('MONGODB_URI') ??
      'mongodb://127.0.0.1:27017/connect-guru';
    const databaseName = this.extractDatabaseName(uri);
    const backupRoot = path.resolve(process.cwd(), 'backups');
    const backupId = `${Date.now()}`;
    const backupPath = path.resolve(backupRoot, backupId);

    if (!existsSync(backupRoot)) {
      mkdirSync(backupRoot, { recursive: true });
    }

    try {
      execSync(`mongodump --uri="${uri}" --out="${backupPath}"`, {
        stdio: 'pipe',
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create MongoDB backup.',
      );
    }

    const created = await this.backupModel.create({
      backupId,
      filename: `${databaseName}-${backupId}.gz`,
      path: backupPath,
      databaseName,
      status: 'completed',
      sizeInBytes: this.getFolderSize(backupPath),
      createdBy: actorId,
    });

    await this.logAuditAction({
      adminId: actorId,
      adminEmail: (await this.getActorEmail(actorId)) ?? 'unknown',
      action: AuditAction.ADMIN_LOGIN,
      details: {
        backupId: created.backupId,
        databaseName,
      },
    });

    return {
      success: true,
      message: 'MongoDB backup created successfully.',
      data: created,
    };
  }

  async listBackups() {
    const backups = await this.backupModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      success: true,
      message: 'Backups fetched successfully.',
      data: backups,
    };
  }

  async restoreBackup(actorId: string, backupId: string) {
    this.assertValidObjectId(actorId, 'Actor id');

    const backup = await this.backupModel.findOne({ backupId }).lean().exec();

    if (!backup) {
      throw new NotFoundException('Backup not found.');
    }

    try {
      execSync(
        `mongorestore --uri="${this.configService.get<string>('MONGODB_URI') ?? 'mongodb://127.0.0.1:27017/connect-guru'}" "${backup.path}"`,
        {
          stdio: 'pipe',
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to restore MongoDB backup.',
      );
    }

    await this.logAuditAction({
      adminId: actorId,
      adminEmail: (await this.getActorEmail(actorId)) ?? 'unknown',
      action: AuditAction.ADMIN_LOGIN,
      details: {
        restoredBackupId: backupId,
      },
    });

    return {
      success: true,
      message: 'Backup restored successfully.',
      data: backup,
    };
  }

  async broadcastAnnouncement(dto: CreateAnnouncementDto) {
    const roleFilter = this.resolveAudience(dto.audience);

    const users = await this.userModel
      .find({ role: { $in: roleFilter }, isDeleted: false })
      .select('_id')
      .lean()
      .exec();

    await Promise.all(
      users.map((user) =>
        this.notificationsService.createNotificationForUser(
          String(user._id),
          NotificationType.ADMIN_ANNOUNCEMENT,
          dto.title,
          dto.message,
          null,
          {
            priority: dto.priority,
            expiresAt: dto.expiresAt ?? null,
            audience: dto.audience,
          },
        ),
      ),
    );

    return {
      success: true,
      message: 'Announcement broadcasted successfully.',
      data: {
        recipientCount: users.length,
        audience: dto.audience,
      },
    };
  }

  private sanitizeAdmin(user: unknown) {
    const userObject = this.toObject(user);
    const {
      password,
      refreshToken,
      superAdminSecret,
      resetPasswordToken,
      emailVerificationOtpHash,
      ...safeUser
    } = userObject;
    return safeUser;
  }

  private async getActorEmail(actorId: string) {
    const actor = await this.userModel
      .findById(actorId)
      .select('email')
      .lean()
      .exec();
    return actor?.email ?? null;
  }

  private async logAuditAction(payload: {
    adminId: string;
    adminEmail: string;
    action: AuditAction;
    details: Record<string, unknown>;
  }) {
    await this.auditLogModel.create({
      adminId: payload.adminId,
      adminEmail: payload.adminEmail,
      action: payload.action,
      details: payload.details,
    });
  }

  private getSafeSortField(sortBy?: string) {
    const allowed = new Set([
      'createdAt',
      'firstName',
      'lastName',
      'email',
      'phone',
      'status',
    ]);
    return allowed.has(sortBy ?? 'createdAt')
      ? (sortBy ?? 'createdAt')
      : 'createdAt';
  }

  private resolveAudience(audience: string) {
    switch (audience) {
      case 'ADMINS':
        return [UserRole.ADMIN];
      case 'TEACHERS':
        return [UserRole.TEACHER];
      case 'STUDENTS':
        return [UserRole.STUDENT];
      case 'ALL':
      default:
        return [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT];
    }
  }

  private assertValidObjectId(id: string, label: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ${label}.`);
    }
  }

  private extractDatabaseName(uri: string) {
    try {
      const url = new URL(uri);
      return url.pathname.replace('/', '') || 'connect-guru';
    } catch {
      return 'connect-guru';
    }
  }

  private getFolderSize(dirPath: string) {
    let totalSize = 0;
    if (!existsSync(dirPath)) return totalSize;

    for (const entry of readdirSync(dirPath)) {
      const fullPath = path.join(dirPath, entry);
      const stat = statSync(fullPath);
      totalSize += stat.size;
    }

    return totalSize;
  }

  private async buildMonthlyCountSeries(
    model: Model<any>,
    filter: Record<string, unknown>,
    entity: string,
  ) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const aggregates = await model.aggregate([
      { $match: { ...filter, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          value: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const series: Array<{ month: string; value: number }> = [];
    const current = new Date();

    for (let index = 11; index >= 0; index -= 1) {
      const monthDate = new Date(
        current.getFullYear(),
        current.getMonth() - index,
        1,
      );
      const label = monthDate.toLocaleString('en-US', { month: 'short' });
      const matched = aggregates.find((item) => {
        const id = item._id as { month: number; year: number };
        return (
          id.year === monthDate.getFullYear() &&
          id.month === monthDate.getMonth() + 1
        );
      });
      series.push({ month: label, value: matched?.value ?? 0 });
    }

    return series;
  }

  private async getTopTeachers() {
    const topTeachers = await this.bookingModel.aggregate([
      { $match: { status: BookingStatus.COMPLETED } },
      { $group: { _id: '$teacherId', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]);

    const teacherIds = topTeachers.map((teacher) => teacher._id);
    const teacherProfiles = await this.userModel
      .find({
        _id: { $in: teacherIds },
        role: UserRole.TEACHER,
        isDeleted: false,
      })
      .select('firstName lastName email')
      .lean()
      .exec();

    return topTeachers.map((teacher) => {
      const profile = teacherProfiles.find(
        (entry) => String(entry._id) === String(teacher._id),
      );
      return {
        teacherId: teacher._id,
        teacherName: profile
          ? `${profile.firstName} ${profile.lastName}`
          : 'Unknown Teacher',
        completedBookings: teacher.bookings,
      };
    });
  }

  private toObject(value: unknown) {
    if (
      value &&
      typeof value === 'object' &&
      'toObject' in value &&
      typeof (value as { toObject?: () => unknown }).toObject === 'function'
    ) {
      return (value as { toObject: () => Record<string, unknown> }).toObject();
    }

    return value as Record<string, unknown>;
  }
}
