import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { TeachersModule } from '../teachers/teachers.module';
import { UsersModule } from '../users/users.module';
import { Booking, BookingSchema } from './schema/booking.schema';
import { BookingsController } from './controllers/bookings.controller';
import { BookingsService } from './services/bookings.service';

@Module({
  imports: [
    UsersModule,
    TeachersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
