import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { Booking, BookingDocument, BookingStatus } from '../schema/booking.schema';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createBooking(studentId: string, dto: CreateBookingDto) {
    const student = await this.usersService.findById(studentId);

    if (!student) {
      throw new UnauthorizedException('Student not found.');
    }

    return this.bookingModel.create({
      studentId,
      teacherId: dto.teacherId,
      subject: dto.subject,
      hourlyRate: dto.hourlyRate ?? 0,
      notes: dto.notes ?? null,
      status: BookingStatus.PENDING,
    });
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
    return booking.save();
  }
}
