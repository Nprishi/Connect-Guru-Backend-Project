import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { Kyc, KycSchema } from '../kyc/schema/kyc.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { UsersModule } from '../users/users.module';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Kyc.name, schema: KycSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
