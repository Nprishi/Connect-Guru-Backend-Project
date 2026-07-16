import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { PackageItem, PackageSchema } from '../packages/schema/package.schema';
import { UsersModule } from '../users/users.module';
import {
  StudentProfile,
  StudentProfileSchema,
} from './schema/student-profile.schema';
import { StudentsController } from './controllers/students.controller';
import { StudentsService } from './services/students.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: StudentProfile.name,
        schema: StudentProfileSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: PackageItem.name,
        schema: PackageSchema,
      },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
