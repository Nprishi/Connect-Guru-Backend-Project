import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { Payment, PaymentSchema } from '../payments/schema/payment.schema';
import { Session, SessionSchema } from '../sessions/schema/session.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
