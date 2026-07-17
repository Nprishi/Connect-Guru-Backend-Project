import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewsService } from '../services/reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  @ApiResponse({ status: 201, description: 'Review created' })
  createReview(
    @CurrentUser('sub') studentId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(studentId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews with pagination' })
  @ApiResponse({ status: 200, description: 'Reviews returned' })
  getReviews(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reviewsService.getReviews(Number(page), Number(limit));
  }

  @Get('teacher/:teacherId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews for a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher reviews returned' })
  getTeacherReviews(
    @Param('teacherId') teacherId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getReviewsForTeacher(
      teacherId,
      Number(page),
      Number(limit),
    );
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated' })
  updateReview(
    @CurrentUser('sub') studentId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(reviewId, studentId, dto);
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  deleteReview(
    @CurrentUser('sub') studentId: string,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, studentId);
  }
}
