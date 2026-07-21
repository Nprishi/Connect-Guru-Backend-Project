import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ResponseUtil } from '../../../common/utils/response.util';
import { Booking, BookingDocument, BookingStatus } from '../../bookings/schema/booking.schema';
import { Category, CategoryDocument } from '../../categories/schema/category.schema';
import { Kyc, KycDocument, KycStatus } from '../../kyc/schema/kyc.schema';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../../notifications/schema/notification.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { PackageItem, PackageDocument } from '../../packages/schema/package.schema';
import { Payment, PaymentDocument, PaymentStatus } from '../../payments/schema/payment.schema';
import { Review, ReviewDocument } from '../../reviews/schema/review.schema';
import { Session, SessionDocument, SessionStatus } from '../../sessions/schema/session.schema';
import { SubjectItem, SubjectDocument } from '../../subjects/schema/subject.schema';
import { TeacherProfile, TeacherProfileDocument } from '../../teachers/schema/teacher-profile.schema';
import { UserRole } from '../../auth/enums/user-role.enum';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { User, UserDocument } from '../../users/schema/user.schema';
import {
  AdminBookingsQueryDto,
  AdminPackagesQueryDto,
  AdminPaymentsQueryDto,
  AdminReviewsQueryDto,
  AdminSessionsQueryDto,
  AdminStudentsQueryDto,
  AdminTeachersQueryDto,
  AdminUsersQueryDto,
} from '../dto/admin-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Kyc.name) private readonly kycModel: Model<KycDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubjectItem.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(PackageItem.name)
    private readonly packageModel: Model<PackageDocument>,
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getDashboard() {
    const verifiedTeacherIds = await this.teacherProfileModel
      .find({ isVerified: true })
      .distinct('userId')
      .exec();

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      bannedUsers,
      totalTeachers,
      totalStudents,
      activeStudents,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      cancelledBookings,
      completedBookings,
      totalPayments,
      completedPayments,
      pendingPayments,
      refundedPayments,
      failedPayments,
      totalRevenue,
      pendingKyc,
      approvedKyc,
      rejectedKyc,
      recentUsers,
      recentBookings,
      recentPayments,
    ] = await Promise.all([
      this.userModel.countDocuments({ isDeleted: false }),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE, isDeleted: false }),
      this.userModel.countDocuments({ status: UserStatus.INACTIVE, isDeleted: false }),
      this.userModel.countDocuments({ status: UserStatus.SUSPENDED, isDeleted: false }),
      this.userModel.countDocuments({ status: UserStatus.BANNED, isDeleted: false }),
      this.userModel.countDocuments({ role: UserRole.TEACHER, isDeleted: false }),
      this.userModel.countDocuments({ role: UserRole.STUDENT, isDeleted: false }),
      this.userModel.countDocuments({ role: UserRole.STUDENT, status: UserStatus.ACTIVE, isDeleted: false }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: BookingStatus.PENDING }),
      this.bookingModel.countDocuments({ status: BookingStatus.ACCEPTED }),
      this.bookingModel.countDocuments({ status: BookingStatus.REJECTED }),
      this.bookingModel.countDocuments({ status: BookingStatus.CANCELLED }),
      this.bookingModel.countDocuments({ status: BookingStatus.COMPLETED }),
      this.paymentModel.countDocuments(),
      this.paymentModel.countDocuments({ status: PaymentStatus.COMPLETED }),
      this.paymentModel.countDocuments({ status: PaymentStatus.PENDING }),
      this.paymentModel.countDocuments({ status: PaymentStatus.REFUNDED }),
      this.paymentModel.countDocuments({ status: PaymentStatus.FAILED }),
      this.paymentModel
        .aggregate([
          { $match: { status: PaymentStatus.COMPLETED } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
        ])
        .exec(),
      this.kycModel.countDocuments({ status: KycStatus.PENDING }),
      this.kycModel.countDocuments({ status: KycStatus.APPROVED }),
      this.kycModel.countDocuments({ status: KycStatus.REJECTED }),
      this.userModel
        .find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
        .lean()
        .exec(),
      this.bookingModel.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
      this.paymentModel.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
    ]);

    return ResponseUtil.success('Admin dashboard summary fetched successfully.', {
      users: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        bannedUsers,
      },
      teachers: {
        totalTeachers,
        verifiedTeachers: verifiedTeacherIds.length,
        pendingTeachers: totalTeachers - verifiedTeacherIds.length,
      },
      students: {
        totalStudents,
        activeStudents,
      },
      bookings: {
        totalBookings,
        pendingBookings,
        acceptedBookings,
        rejectedBookings,
        cancelledBookings,
        completedBookings,
      },
      payments: {
        totalPayments,
        completedPayments,
        pendingPayments,
        refundedPayments,
        failedPayments,
        totalRevenue: totalRevenue[0]?.totalRevenue ?? 0,
      },
      kyc: {
        pendingKyc,
        approvedKyc,
        rejectedKyc,
      },
      recent: {
        recentUsers,
        recentBookings,
        recentPayments,
      },
    });
  }

  async getUsers(query: AdminUsersQueryDto) {
    const filter: Record<string, any> = { isDeleted: false };

    if (query.role) {
      filter.role = query.role;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.$or = [
        { firstName: search },
        { lastName: search },
        { email: search },
        { phone: search },
      ];
    }

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.userModel,
      filter,
      page,
      limit,
      sort,
      '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
    );

    return ResponseUtil.paginated('Users fetched successfully.', payload.items, payload.meta);
  }

  async getUserById(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId, isDeleted: false })
      .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return ResponseUtil.success('User fetched successfully.', user);
  }

  async updateUserStatus(userId: string, status: string) {
    return this.updateUserStatusByRole(userId, status, UserRole.ADMIN, 'User');
  }

  async softDeleteUser(userId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      )
      .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return ResponseUtil.success('User soft deleted successfully.', user);
  }

  async getTeachers(query: AdminTeachersQueryDto) {
    const filter: Record<string, any> = {
      role: UserRole.TEACHER,
      isDeleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.$or = [
        { firstName: search },
        { lastName: search },
        { email: search },
        { phone: search },
      ];
    }

    if (query.verificationStatus) {
      const verifiedIds = await this.teacherProfileModel
        .find({ isVerified: true })
        .distinct('userId')
        .exec();

      if (String(query.verificationStatus) === 'verified') {
        filter._id = { $in: verifiedIds };
      } else {
        filter._id = { $nin: verifiedIds };
      }
    }

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.userModel,
      filter,
      page,
      limit,
      sort,
      '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
    );

    const profiles = await this.teacherProfileModel
      .find({ userId: { $in: payload.items.map((user) => String(user._id)) } })
      .lean()
      .exec();

    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));

    const items = payload.items.map((user) => ({
      user,
      profile: profileMap.get(String(user._id)) ?? null,
    }));

    return ResponseUtil.paginated('Teachers fetched successfully.', items, payload.meta);
  }

  async getTeacherById(teacherId: string) {
    const user = await this.userModel
      .findOne({ _id: teacherId, role: UserRole.TEACHER, isDeleted: false })
      .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('Teacher not found.');
    }

    const profile = await this.teacherProfileModel.findOne({ userId: teacherId }).lean().exec();

    return ResponseUtil.success('Teacher fetched successfully.', {
      user,
      profile,
    });
  }

  async updateTeacherStatus(teacherId: string, status: string) {
    return this.updateUserStatusByRole(teacherId, status, UserRole.TEACHER, 'Teacher');
  }

  async verifyTeacher(teacherId: string) {
    const user = await this.userModel.findOne({
      _id: teacherId,
      role: UserRole.TEACHER,
      isDeleted: false,
    });

    if (!user) {
      throw new NotFoundException('Teacher not found.');
    }

    const profile = await this.teacherProfileModel
      .findOneAndUpdate(
        { userId: teacherId },
        { $set: { isVerified: true } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();

    return ResponseUtil.success('Teacher verified successfully.', {
      user,
      profile,
    });
  }

  async unverifyTeacher(teacherId: string) {
    const user = await this.userModel.findOne({
      _id: teacherId,
      role: UserRole.TEACHER,
      isDeleted: false,
    });

    if (!user) {
      throw new NotFoundException('Teacher not found.');
    }

    const profile = await this.teacherProfileModel
      .findOneAndUpdate(
        { userId: teacherId },
        { $set: { isVerified: false } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();

    return ResponseUtil.success('Teacher unverified successfully.', {
      user,
      profile,
    });
  }

  async getStudents(query: AdminStudentsQueryDto) {
    const filter: Record<string, any> = {
      role: UserRole.STUDENT,
      isDeleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.$or = [
        { firstName: search },
        { lastName: search },
        { email: search },
        { phone: search },
      ];
    }

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.userModel,
      filter,
      page,
      limit,
      sort,
      '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
    );

    return ResponseUtil.paginated('Students fetched successfully.', payload.items, payload.meta);
  }

  async getStudentById(studentId: string) {
    const student = await this.userModel
      .findOne({ _id: studentId, role: UserRole.STUDENT, isDeleted: false })
      .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
      .lean()
      .exec();

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return ResponseUtil.success('Student fetched successfully.', student);
  }

  async updateStudentStatus(studentId: string, status: string) {
    return this.updateUserStatusByRole(studentId, status, UserRole.STUDENT, 'Student');
  }

  async getBookings(query: AdminBookingsQueryDto) {
    const filter: Record<string, any> = {};

    if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.$or = [
        { subject: search },
        { teacherId: search },
        { studentId: search },
      ];
    }

    this.applyDateRangeFilter(filter, query);

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.bookingModel,
      filter,
      page,
      limit,
      sort,
    );

    return ResponseUtil.paginated('Bookings fetched successfully.', payload.items, payload.meta);
  }

  async getBookingById(bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId).lean().exec();

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return ResponseUtil.success('Booking fetched successfully.', booking);
  }

  async updateBookingStatus(bookingId: string, status: string) {
    const booking = await this.bookingModel.findById(bookingId).exec();

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    booking.status = status as BookingStatus;
    const saved = await booking.save();

    return ResponseUtil.success('Booking status updated successfully.', saved);
  }

  async getSessions(query: AdminSessionsQueryDto) {
    const filter: Record<string, any> = {};

    if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    this.applyDateRangeFilter(filter, query);

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.sessionModel,
      filter,
      page,
      limit,
      sort,
    );

    return ResponseUtil.paginated('Sessions fetched successfully.', payload.items, payload.meta);
  }

  async getSessionById(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId).lean().exec();

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    return ResponseUtil.success('Session fetched successfully.', session);
  }

  async cancelSession(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    session.status = SessionStatus.CANCELLED;
    const saved = await session.save();

    return ResponseUtil.success('Session cancelled successfully.', saved);
  }

  async getPayments(query: AdminPaymentsQueryDto) {
    const filter: Record<string, any> = {};

    if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.$or = [
        { transactionId: search },
        { packageId: search },
      ];
    }

    if (query.startDate || query.endDate) {
      this.applyDateRangeFilter(filter, query);
    }

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.paymentModel,
      filter,
      page,
      limit,
      sort,
    );

    return ResponseUtil.paginated('Payments fetched successfully.', payload.items, payload.meta);
  }

  async getKyc(page = 1, limit = 10, status?: string) {
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    const payload = await this.getPaginated(
      this.kycModel,
      filter,
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('KYC submissions fetched successfully.', payload.items, payload.meta);
  }

  async getCategories(page = 1, limit = 10) {
    const payload = await this.getPaginated(
      this.categoryModel,
      {},
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Categories fetched successfully.', payload.items, payload.meta);
  }

  async getSubjects(page = 1, limit = 10) {
    const payload = await this.getPaginated(
      this.subjectModel,
      {},
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Subjects fetched successfully.', payload.items, payload.meta);
  }

  async getNotifications(page = 1, limit = 10) {
    const payload = await this.getPaginated(
      this.notificationModel,
      {},
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Notifications fetched successfully.', payload.items, payload.meta);
  }

  async getAnalytics() {
    const [usersByRole, totalBookings, totalPayments, totalSessions, completedSessions, totalRevenue] =
      await Promise.all([
        this.userModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        this.bookingModel.countDocuments(),
        this.paymentModel.countDocuments(),
        this.sessionModel.countDocuments(),
        this.sessionModel.countDocuments({ status: SessionStatus.COMPLETED }),
        this.paymentModel.aggregate([
          { $match: { status: PaymentStatus.COMPLETED } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
        ]),
      ]);

    const [monthlyBookings, monthlySessions, monthlyRevenue, monthlyUsers] = await Promise.all([
      this.buildMonthlySeries(this.bookingModel, {}, 'count'),
      this.buildMonthlySeries(this.sessionModel, {}, 'count'),
      this.buildMonthlySeries(this.paymentModel, { status: PaymentStatus.COMPLETED }, 'amount'),
      this.buildMonthlySeries(this.userModel, {}, 'count'),
    ]);

    return ResponseUtil.success('Admin analytics fetched successfully.', {
      summary: {
        usersByRole,
        totalBookings,
        totalPayments,
        totalSessions,
        completedSessions,
        completionRate:
          totalSessions > 0
            ? Number(((completedSessions / totalSessions) * 100).toFixed(2))
            : 0,
        totalRevenue: totalRevenue[0]?.totalRevenue ?? 0,
      },
      charts: {
        bookings: monthlyBookings,
        sessions: monthlySessions,
        payments: monthlyRevenue,
        users: monthlyUsers,
      },
    });
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId).lean().exec();

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return ResponseUtil.success('Payment fetched successfully.', payment);
  }

  async refundPayment(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId).exec();

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment already refunded.');
    }

    payment.status = PaymentStatus.REFUNDED;
    const saved = await payment.save();

    return ResponseUtil.success('Payment refunded successfully.', saved);
  }

  async getPackages(query: AdminPackagesQueryDto) {
    const filter: Record<string, any> = {};

    if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.$or = [
        { name: search },
        { description: search },
      ];
    }

    if (query.isActive) {
      filter.isActive = String(query.isActive) === 'true';
    }

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.packageModel,
      filter,
      page,
      limit,
      sort,
    );

    return ResponseUtil.paginated('Packages fetched successfully.', payload.items, payload.meta);
  }

  async getPackageById(packageId: string) {
    const pkg = await this.packageModel.findById(packageId).lean().exec();

    if (!pkg) {
      throw new NotFoundException('Package not found.');
    }

    return ResponseUtil.success('Package fetched successfully.', pkg);
  }

  async updatePackageStatus(packageId: string, status: 'active' | 'inactive') {
    const pkg = await this.packageModel.findById(packageId).exec();

    if (!pkg) {
      throw new NotFoundException('Package not found.');
    }

    pkg.isActive = status === 'active';
    const saved = await pkg.save();

    return ResponseUtil.success('Package status updated successfully.', saved);
  }

  async getReviews(query: AdminReviewsQueryDto) {
    const filter: Record<string, any> = {};

    if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.rating) {
      filter.rating = Number(query.rating);
    }

    if (query.search) {
      const search = new RegExp(String(query.search), 'i');
      filter.comment = search;
    }

    const sort = this.parseSort(String(query.sort ?? 'createdAt:desc'));
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const payload = await this.getPaginated(
      this.reviewModel,
      filter,
      page,
      limit,
      sort,
    );

    return ResponseUtil.paginated('Reviews fetched successfully.', payload.items, payload.meta);
  }

  async deleteReview(reviewId: string) {
    const review = await this.reviewModel.findByIdAndDelete(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    await this.recalculateTeacherRating(review.teacherId);

    return ResponseUtil.success('Review deleted successfully.', { reviewId });
  }

  async createNotification(dto: Record<string, any>) {
    const filter: Record<string, any> = { isDeleted: false };

    if (dto.audience === 'students') {
      filter.role = UserRole.STUDENT;
    }

    if (dto.audience === 'teachers') {
      filter.role = UserRole.TEACHER;
    }

    const users = await this.userModel.find(filter).lean().exec();
    const title = String(dto.title ?? 'Announcement');
    const message = String(dto.message ?? 'A new message from admin');
    const link = dto.link ? String(dto.link) : null;

    await Promise.all(
      users.map((user) =>
        this.notificationsService.createNotification({
          userId: String(user._id),
          type: NotificationType.ADMIN_ANNOUNCEMENT,
          title,
          message,
          link,
          metadata: {},
        }),
      ),
    );

    return ResponseUtil.success('Notification sent successfully.', {
      audience: dto.audience,
      count: users.length,
    });
  }

  async getRevenueReport(query: Record<string, any>, res: any) {
    const filter: Record<string, any> = { status: PaymentStatus.COMPLETED };
    this.applyDateRangeFilter(filter, query, 'createdAt');

    const items = await this.paymentModel.find(filter).lean().exec();
    const rows = (items as any[]).map((payment: any) => ({
      id: payment._id,
      studentId: payment.studentId,
      teacherId: payment.teacherId,
      packageId: payment.packageId,
      amount: payment.amount,
      transactionId: payment.transactionId,
      status: payment.status,
      createdAt: payment.createdAt,
    }));

    return this.handleReportResponse(res, 'revenue-report', rows, query);
  }

  async getUsersReport(query: Record<string, any>, res: any) {
    const filter: Record<string, any> = { isDeleted: false };
    this.applyDateRangeFilter(filter, query, 'createdAt');

    const items = await this.userModel.find(filter).lean().exec();
    const rows = (items as any[]).map((user: any) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));

    return this.handleReportResponse(res, 'users-report', rows, query);
  }

  async getBookingsReport(query: Record<string, any>, res: any) {
    const filter: Record<string, any> = {};
    this.applyDateRangeFilter(filter, query, 'createdAt');

    const items = await this.bookingModel.find(filter).lean().exec();
    const rows = (items as any[]).map((booking: any) => ({
      id: booking._id,
      studentId: booking.studentId,
      teacherId: booking.teacherId,
      subject: booking.subject,
      status: booking.status,
      hourlyRate: booking.hourlyRate,
      notes: booking.notes,
      createdAt: booking.createdAt,
    }));

    return this.handleReportResponse(res, 'bookings-report', rows, query);
  }

  async getPaymentsReport(query: Record<string, any>, res: any) {
    const filter: Record<string, any> = {};
    this.applyDateRangeFilter(filter, query, 'createdAt');

    const items = await this.paymentModel.find(filter).lean().exec();
    const rows = (items as any[]).map((payment: any) => ({
      id: payment._id,
      studentId: payment.studentId,
      teacherId: payment.teacherId,
      packageId: payment.packageId,
      amount: payment.amount,
      transactionId: payment.transactionId,
      status: payment.status,
      createdAt: payment.createdAt,
    }));

    return this.handleReportResponse(res, 'payments-report', rows, query);
  }

  async getTeachersReport(query: Record<string, any>, res: any) {
    const filter: Record<string, any> = { role: UserRole.TEACHER, isDeleted: false };
    this.applyDateRangeFilter(filter, query, 'createdAt');

    const users = await this.userModel.find(filter).lean().exec();
    const profiles = await this.teacherProfileModel
      .find({ userId: { $in: (users as any[]).map((user: any) => String(user._id)) } })
      .lean()
      .exec();

    const profileMap = new Map((profiles as any[]).map((profile: any) => [profile.userId, profile]));
    const rows = (users as any[]).map((user: any) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      isVerified: profileMap.get(String(user._id))?.isVerified ?? false,
      createdAt: user.createdAt,
    }));

    return this.handleReportResponse(res, 'teachers-report', rows, query);
  }

  async getStudentsReport(query: Record<string, any>, res: any) {
    const filter: Record<string, any> = { role: UserRole.STUDENT, isDeleted: false };
    this.applyDateRangeFilter(filter, query, 'createdAt');

    const users = await this.userModel.find(filter).lean().exec();
    const rows = (users as any[]).map((user: any) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    }));

    return this.handleReportResponse(res, 'students-report', rows, query);
  }

  private async updateUserStatusByRole(
    userId: string,
    status: string,
    role: UserRole,
    entityName: string,
  ) {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, role, isDeleted: false },
        { status },
        { new: true },
      )
      .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
      .exec();

    if (!user) {
      throw new NotFoundException(`${entityName} not found.`);
    }

    return ResponseUtil.success(`${entityName} status updated successfully.`, user);
  }

  private async recalculateTeacherRating(teacherId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { teacherId } },
      {
        $group: {
          _id: '$teacherId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result[0]?.averageRating ?? 0;
    const totalReviews = result[0]?.totalReviews ?? 0;

    await this.userModel.findByIdAndUpdate(teacherId, {
      rating: Number(averageRating.toFixed(2)),
      totalReviews,
    });
  }

  private applyDateRangeFilter(
    filter: Record<string, any>,
    query: Record<string, any>,
    field = 'createdAt',
  ) {
    const startDate = query.startDate ? new Date(String(query.startDate)) : null;
    const endDate = query.endDate ? new Date(String(query.endDate)) : null;

    if (startDate || endDate) {
      const range: Record<string, unknown> = {};

      if (startDate && !Number.isNaN(startDate.getTime())) {
        range.$gte = startDate;
      }

      if (endDate && !Number.isNaN(endDate.getTime())) {
        range.$lte = endDate;
      }

      if (Object.keys(range).length > 0) {
        filter[field] = range;
      }
    }
  }

  private parseSort(sortQuery: string): Record<string, 1 | -1> {
    const [field, direction] = sortQuery.split(':');
    const sortDirection: 1 | -1 = direction === 'asc' ? 1 : -1;
    return { [field]: sortDirection };
  }

  private async handleReportResponse(
    res: any,
    filename: string,
    rows: Array<Record<string, unknown>>,
    query: Record<string, unknown>,
  ) {
    const exportType = String(query.export ?? '').toLowerCase();

    if (exportType === 'csv') {
      const csv = this.buildCsv(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }

    if (exportType === 'pdf') {
      return this.buildPdfResponse(res, filename, rows);
    }

    return ResponseUtil.success(`${filename} fetched successfully.`, { rows });
  }

  private buildCsv(rows: Array<Record<string, unknown>>) {
    if (rows.length === 0) {
      return '';
    }

    const headers = Object.keys(rows[0]);
    const headerRow = headers.join(',');
    const dataRows = rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    return [headerRow, ...dataRows].join('\n');
  }

  private buildPdfResponse(res: any, filename: string, rows: Array<Record<string, any>>) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    doc.pipe(res);
    doc.fontSize(18).text(filename.replace(/-/g, ' ').toUpperCase(), { align: 'center' });
    doc.moveDown();

    if (rows.length === 0) {
      doc.fontSize(12).text('No records available.', { align: 'left' });
      doc.end();
      return;
    }

    const headers = Object.keys(rows[0]);
    headers.forEach((header, index) => {
      doc.fontSize(10).fillColor('black').text(String(header), {
        continued: index !== headers.length - 1,
        width: 120,
      });
    });
    doc.moveDown();

    rows.forEach((row) => {
      headers.forEach((header, index) => {
        doc.fontSize(9).fillColor('black').text(String(row[header] ?? ''), {
          continued: index !== headers.length - 1,
          width: 120,
        });
      });
      doc.moveDown();
    });

    doc.end();
  }

  private async getPaginated(
    model: Model<any>,
    filter: Record<string, any>,
    page = 1,
    limit = 10,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
    select = '',
  ) {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 10);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const query = model.find(filter).sort(sort).skip(skip).limit(normalizedLimit);

    if (select) {
      query.select(select);
    }

    const [items, total] = await Promise.all([
      query.lean().exec(),
      model.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        pages: Math.ceil(total / normalizedLimit),
      },
    };
  }

  private async buildMonthlySeries(
    model: Model<any>,
    filter: Record<string, any>,
    valueType: 'count' | 'amount',
  ) {
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const docs = await model.find({ ...filter, createdAt: { $gte: start } }).lean().exec();
    const monthMap = new Map<string, number>();

    for (const doc of docs) {
      const key = `${doc.createdAt.getFullYear()}-${doc.createdAt.getMonth() + 1}`;
      const nextValue = valueType === 'amount' ? Number(doc.amount ?? 0) : 1;
      monthMap.set(key, (monthMap.get(key) ?? 0) + nextValue);
    }

    const series: Array<{ label: string; value: number }> = [];
    for (let index = 5; index >= 0; index -= 1) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - index);
      monthDate.setDate(1);
      const label = monthDate.toLocaleString('en-US', { month: 'short' });
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
      series.push({ label, value: monthMap.get(key) ?? 0 });
    }

    return series;
  }
}
