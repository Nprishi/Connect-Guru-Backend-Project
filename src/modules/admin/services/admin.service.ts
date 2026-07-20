import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ResponseUtil } from '../../../common/utils/response.util';
import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import { Category, CategoryDocument } from '../../categories/schema/category.schema';
import { Kyc, KycDocument, KycStatus } from '../../kyc/schema/kyc.schema';
import { Notification, NotificationDocument } from '../../notifications/schema/notification.schema';
import { PackageItem, PackageDocument } from '../../packages/schema/package.schema';
import { Payment, PaymentDocument } from '../../payments/schema/payment.schema';
import { Review, ReviewDocument } from '../../reviews/schema/review.schema';
import { Session, SessionDocument } from '../../sessions/schema/session.schema';
import { SubjectItem, SubjectDocument } from '../../subjects/schema/subject.schema';
import { UserRole } from '../../auth/enums/user-role.enum';
import { User, UserDocument } from '../../users/schema/user.schema';

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
  ) {}

  async getDashboard() {
    const [
      totalUsers,
      activeUsers,
      totalTeachers,
      totalStudents,
      pendingBookings,
      pendingKyc,
      pendingPayments,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'active' }),
      this.userModel.countDocuments({ role: UserRole.TEACHER }),
      this.userModel.countDocuments({ role: UserRole.STUDENT }),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.kycModel.countDocuments({ status: KycStatus.PENDING }),
      this.paymentModel.countDocuments({ status: 'pending' }),
    ]);

    return ResponseUtil.success('Admin dashboard summary fetched successfully.', {
      totalUsers,
      activeUsers,
      totalTeachers,
      totalStudents,
      pendingBookings,
      pendingKyc,
      pendingPayments,
      pendingReviews: pendingKyc,
    });
  }

  async getUsers(page = 1, limit = 10, role?: UserRole) {
    const filter = role ? { role } : {};
    const payload = await this.getPaginated(
      this.userModel,
      filter,
      page,
      limit,
      { createdAt: -1 },
      '-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash',
    );

    return ResponseUtil.paginated('Users fetched successfully.', payload.items, payload.meta);
  }

  async getTeachers(page = 1, limit = 10) {
    return this.getUsers(page, limit, UserRole.TEACHER);
  }

  async getStudents(page = 1, limit = 10) {
    return this.getUsers(page, limit, UserRole.STUDENT);
  }

  async getBookings(page = 1, limit = 10, status?: string) {
    const filter = status ? { status } : {};
    const payload = await this.getPaginated(
      this.bookingModel,
      filter,
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Bookings fetched successfully.', payload.items, payload.meta);
  }

  async getSessions(page = 1, limit = 10, status?: string) {
    const filter = status ? { status } : {};
    const payload = await this.getPaginated(
      this.sessionModel,
      filter,
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Sessions fetched successfully.', payload.items, payload.meta);
  }

  async getPayments(page = 1, limit = 10, status?: string) {
    const filter = status ? { status } : {};
    const payload = await this.getPaginated(
      this.paymentModel,
      filter,
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Payments fetched successfully.', payload.items, payload.meta);
  }

  async getKyc(page = 1, limit = 10, status?: string) {
    const filter = status ? { status } : {};
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

  async getPackages(page = 1, limit = 10) {
    const payload = await this.getPaginated(
      this.packageModel,
      {},
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Packages fetched successfully.', payload.items, payload.meta);
  }

  async getReviews(page = 1, limit = 10) {
    const payload = await this.getPaginated(
      this.reviewModel,
      {},
      page,
      limit,
      { createdAt: -1 },
    );

    return ResponseUtil.paginated('Reviews fetched successfully.', payload.items, payload.meta);
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
        this.sessionModel.countDocuments({ status: 'completed' }),
        this.paymentModel.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
        ]),
      ]);

    const [monthlyBookings, monthlySessions, monthlyRevenue, monthlyUsers] = await Promise.all([
      this.buildMonthlySeries(this.bookingModel, {}, 'count'),
      this.buildMonthlySeries(this.sessionModel, {}, 'count'),
      this.buildMonthlySeries(this.paymentModel, { status: 'completed' }, 'amount'),
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

  async getReports() {
    const [totalTeachers, totalStudents, totalBookings, totalPayments, pendingKyc, totalRevenue] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.TEACHER }),
      this.userModel.countDocuments({ role: UserRole.STUDENT }),
      this.bookingModel.countDocuments(),
      this.paymentModel.countDocuments(),
      this.kycModel.countDocuments({ status: KycStatus.PENDING }),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
    ]);

    return ResponseUtil.success('Admin reports fetched successfully.', {
      totals: {
        teachers: totalTeachers,
        students: totalStudents,
        bookings: totalBookings,
        payments: totalPayments,
        pendingKyc,
        totalRevenue: totalRevenue[0]?.totalRevenue ?? 0,
      },
    });
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { status } },
        { new: true },
      )
      .select('-password -refreshToken -superAdminSecret -resetPasswordToken -emailVerificationOtpHash')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return ResponseUtil.success('User status updated successfully.', user);
  }

  private async getPaginated(
    model: Model<any>,
    filter: Record<string, unknown>,
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
    filter: Record<string, unknown>,
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
