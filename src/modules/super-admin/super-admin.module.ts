import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { Category, CategorySchema } from '../categories/schema/category.schema';
import { Kyc, KycSchema } from '../kyc/schema/kyc.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { Payment, PaymentSchema } from '../payments/schema/payment.schema';
import { Session, SessionSchema } from '../sessions/schema/session.schema';
import { SubjectItem, SubjectSchema } from '../subjects/schema/subject.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { UsersModule } from '../users/users.module';
import { AuditLog, AuditLogSchema } from './schema/audit-log.schema';
import {
  SystemSettings,
  SystemSettingsSchema,
} from './schema/system-settings.schema';

import { SuperAdminController } from './controllers/super-admin.controller';
import { SuperAdminService } from './services/super-admin.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
      {
        name: Kyc.name,
        schema: KycSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: SubjectItem.name,
        schema: SubjectSchema,
      },
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: SystemSettings.name,
        schema: SystemSettingsSchema,
      },
      {
        name: AuditLog.name,
        schema: AuditLogSchema,
      },
    ]),
  ],

  controllers: [SuperAdminController],

  providers: [SuperAdminService],

  exports: [SuperAdminService],
})
export class SuperAdminModule {}
