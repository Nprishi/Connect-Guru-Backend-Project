import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { Notification, NotificationSchema } from '../notifications/schema/notification.schema';
import { PackageItem, PackageSchema } from '../packages/schema/package.schema';
import { Session, SessionSchema } from '../sessions/schema/session.schema';
import { TeacherProfile, TeacherProfileSchema } from '../teachers/schema/teacher-profile.schema';
import { User, UserSchema } from '../users/schema/user.schema';
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
      {
        name: TeacherProfile.name,
        schema: TeacherProfileSchema,
      },
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
