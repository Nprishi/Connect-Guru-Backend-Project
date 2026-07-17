import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
import { Booking, BookingDocument, BookingStatus } from '../schema/booking.schema';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createBooking(studentId: string, dto: CreateBookingDto) {
    const student = await this.usersService.findById(studentId);

    if (!student) {
      throw new UnauthorizedException('Student not found.');
    }

    const booking = await this.bookingModel.create({
      studentId,
      teacherId: dto.teacherId,
      subject: dto.subject,
      hourlyRate: dto.hourlyRate ?? 0,
      notes: dto.notes ?? null,
      status: BookingStatus.PENDING,
    });

    await this.notificationsService.notifyBookingCreated(studentId, dto.teacherId, booking.id);
    return booking;
  }

  async getBookingsForUser(userId: string) {
    return this.bookingModel
      .find({ $or: [{ studentId: userId }, { teacherId: userId }] })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateBookingStatus(bookingId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    booking.status = dto.status;
    const saved = await booking.save();

    if (dto.status === BookingStatus.ACCEPTED) {
      await this.notificationsService.notifyBookingAccepted(booking.studentId, booking.teacherId, booking.id);
    }

    if (dto.status === BookingStatus.REJECTED) {
      await this.notificationsService.notifyBookingRejected(booking.studentId, booking.teacherId, booking.id);
    }

    return saved;
  }
}
