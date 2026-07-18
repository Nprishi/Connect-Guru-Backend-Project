/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import { Payment, PaymentDocument } from '../../payments/schema/payment.schema';
import { Session, SessionDocument } from '../../sessions/schema/session.schema';
import { User, UserDocument } from '../../users/schema/user.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getStudentAnalytics(studentId: string) {
    const [totalBookings, totalPayments, totalSessions, completedSessions] =
      await Promise.all([
        this.bookingModel.countDocuments({ studentId }),
        this.paymentModel.countDocuments({ studentId }),
        this.sessionModel.countDocuments({ studentId }),
        this.sessionModel.countDocuments({ studentId, status: 'completed' }),
      ]);

    const [
      recentBookings,
      recentSessions,
      monthlyBookings,
      monthlySessions,
      monthlyPayments,
    ] = await Promise.all([
      this.bookingModel
        .find({ studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      this.sessionModel
        .find({ studentId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      this.buildMonthlySeries(this.bookingModel, { studentId }, 'count'),
      this.buildMonthlySeries(this.sessionModel, { studentId }, 'count'),
      this.buildMonthlySeries(this.paymentModel, { studentId }, 'amount'),
    ]);

    return {
      summary: {
        totalBookings,
        totalPayments,
        totalSessions,
        completedSessions,
        completionRate:
          totalSessions > 0
            ? Number(((completedSessions / totalSessions) * 100).toFixed(2))
            : 0,
      },
      charts: {
        bookings: monthlyBookings,
        sessions: monthlySessions,
        payments: monthlyPayments,
      },
      recentActivity: {
        bookings: recentBookings,
        sessions: recentSessions,
      },
      lastActivity: await this.sessionModel
        .findOne({ studentId })
        .sort({ updatedAt: -1 })
        .lean()
        .exec(),
    };
  }

  async getTeacherAnalytics(teacherId: string) {
    const [
      totalBookings,
      totalSessions,
      totalRevenue,
      completedSessions,
      avgSessionDuration,
    ] = await Promise.all([
      this.bookingModel.countDocuments({ teacherId }),
      this.sessionModel.countDocuments({ teacherId }),
      this.paymentModel.aggregate([
        { $match: { teacherId, status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      this.sessionModel.countDocuments({ teacherId, status: 'completed' }),
      this.sessionModel.aggregate([
        {
          $match: {
            teacherId,
            startedAt: { $ne: null },
            endedAt: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgMinutes: { $avg: { $subtract: ['$endedAt', '$startedAt'] } },
          },
        },
      ]),
    ]);

    const [
      monthlyBookings,
      monthlySessions,
      monthlyRevenue,
      recentBookings,
      recentSessions,
    ] = await Promise.all([
      this.buildMonthlySeries(this.bookingModel, { teacherId }, 'count'),
      this.buildMonthlySeries(this.sessionModel, { teacherId }, 'count'),
      this.buildMonthlySeries(
        this.paymentModel,
        { teacherId, status: 'completed' },
        'amount',
      ),
      this.bookingModel
        .find({ teacherId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      this.sessionModel
        .find({ teacherId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean()
        .exec(),
    ]);

    return {
      summary: {
        totalBookings,
        totalSessions,
        completedSessions,
        completionRate:
          totalSessions > 0
            ? Number(((completedSessions / totalSessions) * 100).toFixed(2))
            : 0,
        avgSessionDuration: avgSessionDuration[0]?.avgMinutes ?? 0,
        totalRevenue: totalRevenue[0]?.totalRevenue ?? 0,
      },
      charts: {
        bookings: monthlyBookings,
        sessions: monthlySessions,
        revenue: monthlyRevenue,
      },
      recentActivity: {
        bookings: recentBookings,
        sessions: recentSessions,
      },
    };
  }

  async getAdminAnalytics() {
    const [
      usersByRole,
      totalBookings,
      totalPayments,
      totalSessions,
      completedSessions,
      totalRevenue,
    ] = await Promise.all([
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      this.bookingModel.countDocuments(),
      this.paymentModel.countDocuments(),
      this.sessionModel.countDocuments(),
      this.sessionModel.countDocuments({ status: 'completed' }),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
    ]);

    const [monthlyBookings, monthlySessions, monthlyRevenue, monthlyUsers] =
      await Promise.all([
        this.buildMonthlySeries(this.bookingModel, {}, 'count'),
        this.buildMonthlySeries(this.sessionModel, {}, 'count'),
        this.buildMonthlySeries(
          this.paymentModel,
          { status: 'completed' },
          'amount',
        ),
        this.buildMonthlySeries(this.userModel, {}, 'count'),
      ]);

    return {
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
        revenue: monthlyRevenue,
        users: monthlyUsers,
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

    const docs = await model
      .find({ ...filter, createdAt: { $gte: start } })
      .lean()
      .exec();
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
 