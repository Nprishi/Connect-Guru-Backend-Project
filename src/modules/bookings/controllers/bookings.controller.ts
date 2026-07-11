import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dto/create-booking.dto';
import { BookingsService } from '../services/bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createBooking(
    @CurrentUser('sub') studentId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(studentId, createBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getBookingsForUser(@CurrentUser('sub') userId: string) {
    return this.bookingsService.getBookingsForUser(userId);
  }

  @Put(':bookingId/status')
  @UseGuards(JwtAuthGuard)
  updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(bookingId, updateBookingStatusDto);
  }
}
