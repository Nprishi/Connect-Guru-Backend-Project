import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { ReviewsController } from './controllers/reviews.controller';
import { Review, ReviewSchema } from './schema/review.schema';
import { ReviewsService } from './services/reviews.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema,
      },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
