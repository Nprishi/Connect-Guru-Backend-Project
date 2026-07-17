import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { SessionsController } from './controllers/sessions.controller';
import { Session, SessionSchema } from './schema/session.schema';
import { SessionsService } from './services/sessions.service';

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
