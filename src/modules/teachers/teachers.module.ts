import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import {
  TeacherProfile,
  TeacherProfileSchema,
} from './schema/teacher-profile.schema';
import { TeachersController } from './controllers/teachers.controller';
import { TeachersService } from './services/teachers.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: TeacherProfile.name,
        schema: TeacherProfileSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
