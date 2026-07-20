import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dto/create-booking.dto';
import { BookingsService } from '../services/bookings.service';

@ApiTags('Bookings')
@ApiBearerAuth('JWT')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a booking for a teacher' })
  @ApiBody({
    schema: {
      example: {
        teacherId: '64df2a9f0db4ae12b7f0f123',
        subject: 'Mathematics',
        hourlyRate: 1200,
        notes: 'Need help with calculus assignments',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Booking created' })
  createBooking(
    @CurrentUser('sub') studentId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(studentId, createBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get bookings for the current user' })
  @ApiResponse({ status: 200, description: 'Bookings returned' })
  getBookingsForUser(@CurrentUser('sub') userId: string) {
    return this.bookingsService.getBookingsForUser(userId);
  }

  @Put(':bookingId/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update booking status' })
  @ApiBody({
    schema: {
      example: {
        status: 'accepted',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Booking status updated' })
  updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(bookingId, updateBookingStatusDto);
  }
}
