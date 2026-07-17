import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review, ReviewDocument } from '../schema/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createReview(studentId: string, dto: CreateReviewDto) {
    const student = await this.usersService.findById(studentId);
    const teacher = await this.usersService.findById(dto.teacherId);

    if (!student || !teacher) {
      throw new UnauthorizedException('Student or teacher not found.');
    }

    const review = await this.reviewModel.create({
      teacherId: dto.teacherId,
      studentId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    await this.recalculateTeacherAverage(dto.teacherId);
    return review;
  }

  async getReviews(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.reviewModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.reviewModel.countDocuments(),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewsForTeacher(teacherId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.reviewModel.find({ teacherId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.reviewModel.countDocuments({ teacherId }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateReview(reviewId: string, studentId: string, dto: UpdateReviewDto) {
    const review = await this.reviewModel.findOne({ _id: reviewId, studentId });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    Object.assign(review, dto);
    const saved = await review.save();
    await this.recalculateTeacherAverage(review.teacherId);
    return saved;
  }

  async deleteReview(reviewId: string, studentId: string) {
    const review = await this.reviewModel.findOneAndDelete({ _id: reviewId, studentId });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    await this.recalculateTeacherAverage(review.teacherId);
    return { success: true, message: 'Review deleted successfully.' };
  }

  private async recalculateTeacherAverage(teacherId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { teacherId } },
      { $group: { _id: '$teacherId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);

    const user = await this.usersService.findById(teacherId);
    if (!user) {
      return;
    }

    const averageRating = result[0]?.averageRating ?? 0;
    const totalReviews = result[0]?.totalReviews ?? 0;

    await this.usersService.updateProfile(teacherId, {
      rating: Number(averageRating.toFixed(2)),
      totalReviews,
    });
  }
}
