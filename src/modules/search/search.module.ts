import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Booking, BookingSchema } from '../bookings/schema/booking.schema';
import { PackageItem, PackageSchema } from '../packages/schema/package.schema';
import { Review, ReviewSchema } from '../reviews/schema/review.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../students/schema/student-profile.schema';
import {
  TeacherProfile,
  TeacherProfileSchema,
} from '../teachers/schema/teacher-profile.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TeacherProfile.name,
        schema: TeacherProfileSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: PackageItem.name,
        schema: PackageSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      {
        name: StudentProfile.name,
        schema: StudentProfileSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
