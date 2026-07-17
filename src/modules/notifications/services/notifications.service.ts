import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { NotificationsGateway } from '../notifications.gateway';
import { Notification, NotificationDocument, NotificationType } from '../schema/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    const user = await this.usersService.findById(data.userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const notification = await this.notificationModel.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link ?? null,
      metadata: data.metadata ?? {},
      isRead: false,
    });

    this.notificationsGateway.emitToUser(data.userId, {
      notification,
      event: data.type,
    });

    return notification;
  }

  async createNotificationForUser(userId: string, type: NotificationType, title: string, message: string, link?: string | null, metadata?: Record<string, unknown>) {
    return this.createNotification({ userId, type, title, message, link, metadata });
  }

  async getNotificationsForUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({ userId, isRead: false });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({ _id: notificationId, userId });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    notification.isRead = true;
    return notification.save();
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    return { success: true, message: 'All notifications marked as read.' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const deleted = await this.notificationModel.findOneAndDelete({ _id: notificationId, userId });

    if (!deleted) {
      throw new NotFoundException('Notification not found.');
    }

    return { success: true, message: 'Notification deleted successfully.' };
  }

  async notifyUserRegistered(userId: string) {
    return this.createNotificationForUser(
      userId,
      NotificationType.USER_REGISTERED,
      'Welcome to Connect Guru',
      'Your account has been created successfully. Complete your profile to get started.',
    );
  }

  async notifyUserLoggedIn(userId: string) {
    return this.createNotificationForUser(
      userId,
      NotificationType.USER_LOGGED_IN,
      'Welcome back',
      'You have successfully signed in to your account.',
    );
  }

  async notifyBookingCreated(studentId: string, teacherId: string, bookingId: string) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.BOOKING_CREATED,
      'Booking request sent',
      'Your booking request has been submitted and is awaiting teacher approval.',
      '/bookings/' + bookingId,
      { teacherId, bookingId },
    );
  }

  async notifyBookingAccepted(studentId: string, teacherId: string, bookingId: string) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.BOOKING_ACCEPTED,
      'Booking accepted',
      'Your booking request has been accepted by the teacher.',
      '/bookings/' + bookingId,
      { teacherId, bookingId },
    );
  }

  async notifyBookingRejected(studentId: string, teacherId: string, bookingId: string) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.BOOKING_REJECTED,
      'Booking rejected',
      'Your booking request was rejected by the teacher. You can try another slot.',
      '/bookings/' + bookingId,
      { teacherId, bookingId },
    );
  }

  async notifyPackagePurchased(studentId: string, packageId: string) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.PACKAGE_PURCHASED,
      'Package purchased',
      'Your learning package has been purchased successfully.',
      '/packages/' + packageId,
      { packageId },
    );
  }

  async notifySessionStarted(studentId: string, teacherId: string, sessionId: string) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.SESSION_STARTED,
      'Session started',
      'Your class session has started.',
      '/sessions/' + sessionId,
      { teacherId, sessionId },
    );
  }

  async notifySessionEnded(studentId: string, teacherId: string, sessionId: string) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.SESSION_ENDED,
      'Session ended',
      'Your class session has ended successfully.',
      '/sessions/' + sessionId,
      { teacherId, sessionId },
    );
  }

  async notifyPaymentCompleted(studentId: string, paymentId: string, amount: number) {
    await this.createNotificationForUser(
      studentId,
      NotificationType.PAYMENT_COMPLETED,
      'Payment completed',
      `Your payment of ${amount} has been completed successfully.`,
      '/payments/' + paymentId,
      { paymentId, amount },
    );
  }

  async notifyKycApproved(userId: string) {
    await this.createNotificationForUser(
      userId,
      NotificationType.KYC_APPROVED,
      'KYC approved',
      'Your KYC verification has been approved. You can now use the full platform features.',
    );
  }

  async notifyAdminAnnouncement(userId: string, title: string, message: string) {
    await this.createNotificationForUser(
      userId,
      NotificationType.ADMIN_ANNOUNCEMENT,
      title,
      message,
    );
  }
}
