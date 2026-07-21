import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { Category, CategorySchema } from '../categories/schema/category.schema';
import { Kyc, KycSchema } from '../kyc/schema/kyc.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { Notification, NotificationSchema } from '../notifications/schema/notification.schema';
import { PackageItem, PackageSchema } from '../packages/schema/package.schema';
import { Payment, PaymentSchema } from '../payments/schema/payment.schema';
import { Review, ReviewSchema } from '../reviews/schema/review.schema';
import { Session, SessionSchema } from '../sessions/schema/session.schema';
import { SubjectItem, SubjectSchema } from '../subjects/schema/subject.schema';
import { TeacherProfile, TeacherProfileSchema } from '../teachers/schema/teacher-profile.schema';
import { TeachersModule } from '../teachers/teachers.module';
import { User, UserSchema } from '../users/schema/user.schema';
import { UsersModule } from '../users/users.module';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    UsersModule,
    TeachersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Kyc.name, schema: KycSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubjectItem.name, schema: SubjectSchema },
      { name: PackageItem.name, schema: PackageSchema },
      { name: TeacherProfile.name, schema: TeacherProfileSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
