/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Booking, BookingDocument } from '../../bookings/schema/booking.schema';
import {
  PackageItem,
  PackageDocument,
} from '../../packages/schema/package.schema';
import { Review, ReviewDocument } from '../../reviews/schema/review.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../../students/schema/student-profile.schema';
import {
  TeacherProfile,
  TeacherProfileDocument,
} from '../../teachers/schema/teacher-profile.schema';
import { User, UserDocument } from '../../users/schema/user.schema';
import { PackageSearchDto } from '../dto/package-search.dto';
import { TeacherSearchDto } from '../dto/teacher-search.dto';

type TeacherProfileLike = {
  userId: string;
  subjects?: string[];
  experience?: string[];
  availability?: string[];
  bio?: string | null;
  rating?: number;
  totalReviews?: number;
};
type StudentProfileLike = {
  userId: string;
  preferredSubjects?: string[];
  learningGoals?: string[];
  interests?: string[];
};
type BookingLike = {
  studentId: string;
  teacherId: string;
  subject: string;
};
type ReviewLike = {
  studentId: string;
  teacherId: string;
  rating: number;
};

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PackageItem.name)
    private readonly packageModel: Model<PackageDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
  ) {}

  async globalSearch(query: string) {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      return {
        items: [],
        meta: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    }

    const [teachers, packages] = await Promise.all([
      this.teacherProfileModel.find().lean().exec() as Promise<TeacherProfileLike[]>,
      this.packageModel.find({ isActive: true }).lean().exec() as Promise<PackageItem[]>,
    ]);

    const teacherQuery = this.extractTerms([trimmedQuery]);

    const teacherMatches = teachers
      .map((teacher) => {
        const docs = this.extractTerms([
          teacher.subjects,
          teacher.experience,
          teacher.availability,
          teacher.bio,
        ]);
        const score = this.calculateBm25Score(
          docs,
          teacherQuery,
          this.buildDocumentFrequency(
            teachers.map((profile) =>
              this.extractTerms([
                profile.subjects,
                profile.experience,
                profile.availability,
                profile.bio,
              ]),
            ),
          ),
          docs.length || 1,
          teachers.length || 1,
        );

        return { teacher, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 10);

    const packageMatches = packages
      .filter((pkg) => {
        const haystack = `${pkg.name} ${pkg.description}`.toLowerCase();
        return haystack.includes(trimmedQuery.toLowerCase());
      })
      .slice(0, 10);

    const teacherItems = await Promise.all(
      teacherMatches.map(async ({ teacher }) => {
        const user = await this.userModel
          .findById(teacher.userId)
          .lean()
          .exec();
        return { teacher, user };
      }),
    );

    return {
      items: {
        teachers: teacherItems,
        packages: packageMatches,
      },
      meta: {
        page: 1,
        limit: 10,
        total: teacherItems.length + packageMatches.length,
        pages: 1,
      },
    };
  }

  async searchTeachers(dto: TeacherSearchDto) {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (dto.subject) {
      filter.subjects = { $in: [new RegExp(dto.subject, 'i')] };
    }

    if (dto.experience) {
      filter.experience = { $in: [new RegExp(dto.experience, 'i')] };
    }

    if (dto.availability) {
      filter.availability = { $in: [new RegExp(dto.availability, 'i')] };
    }

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      filter.hourlyRate = {} as Record<string, number>;

      if (dto.minPrice !== undefined) {
        (filter.hourlyRate as Record<string, number>).$gte = dto.minPrice;
      }

      if (dto.maxPrice !== undefined) {
        (filter.hourlyRate as Record<string, number>).$lte = dto.maxPrice;
      }
    }

    if (dto.rating !== undefined) {
      filter.rating = { $gte: dto.rating };
    }

    const profiles = (await this.teacherProfileModel
      .find(filter)
      .lean()
      .exec()) as TeacherProfileLike[];
    const allProfiles = (await this.teacherProfileModel
      .find()
      .lean()
      .exec()) as TeacherProfileLike[];
    const corpusTerms = allProfiles.map((profile) =>
      this.extractTerms([
        profile.subjects,
        profile.experience,
        profile.availability,
        profile.bio,
      ]),
    );
    const avgDocLength =
      corpusTerms.reduce((sum, terms) => sum + terms.length, 0) /
      Math.max(corpusTerms.length, 1);
    const documentFrequency = this.buildDocumentFrequency(corpusTerms);
    const queryTerms = this.extractTerms([
      dto.subject,
      dto.experience,
      dto.availability,
    ]);

    const scoredProfiles = profiles.map((profile) => {
      const docTerms = this.extractTerms([
        profile.subjects,
        profile.experience,
        profile.availability,
        profile.bio,
      ]);
      const score = this.calculateBm25Score(
        docTerms,
        queryTerms,
        documentFrequency,
        avgDocLength,
        corpusTerms.length,
      );

      return { profile, score };
    });

    scoredProfiles.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (dto.sort?.startsWith('rating')) {
        return (
          Number(right.profile.rating ?? 0) - Number(left.profile.rating ?? 0)
        );
      }

      return 0;
    });

    const total = scoredProfiles.length;
    const pagedProfiles = scoredProfiles
      .slice(skip, skip + limit)
      .map((item) => item.profile);

    const items = await Promise.all(
      pagedProfiles.map(async (profile) => {
        const user = await this.userModel
          .findById(profile.userId)
          .lean()
          .exec();
        return { profile, user };
      }),
    );

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

  async searchPackages(dto: PackageSearchDto) {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isActive: true };

    if (dto.subject) {
      filter.$or = [
        { name: new RegExp(dto.subject, 'i') },
        { description: new RegExp(dto.subject, 'i') },
      ];
    }

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      filter.price = {} as Record<string, number>;

      if (dto.minPrice !== undefined) {
        (filter.price as Record<string, number>).$gte = dto.minPrice;
      }

      if (dto.maxPrice !== undefined) {
        (filter.price as Record<string, number>).$lte = dto.maxPrice;
      }
    }

    const sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (dto.sort) {
      const [field, direction] = dto.sort.split(':');
      if (field === 'price') {
        sort.price = direction === 'asc' ? 1 : -1;
      }
      if (field === 'newest') {
        sort.createdAt = direction === 'asc' ? 1 : -1;
      }
    }

    const [items, total] = await Promise.all([
      this.packageModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.packageModel.countDocuments(filter),
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

  async recommendTeachers(studentId: string) {
    const currentStudent = await this.userModel
      .findById(studentId)
      .lean()
      .exec();
    const studentProfile = (await this.studentProfileModel
      .findOne({ userId: studentId })
      .lean()
      .exec()) as StudentProfileLike | null;

    if (!currentStudent) {
      return { items: [], meta: { page: 1, limit: 10, total: 0, pages: 0 } };
    }

    const [teacherProfiles, studentProfiles, bookings, reviews] =
      await Promise.all([
        (await this.teacherProfileModel
          .find()
          .lean()
          .exec()) as TeacherProfileLike[],
        (await this.studentProfileModel
          .find()
          .lean()
          .exec()) as StudentProfileLike[],
        (await this.bookingModel.find().lean().exec()) as BookingLike[],
        (await this.reviewModel.find().lean().exec()) as ReviewLike[],
      ]);

    const teacherVectors = new Map<string, string[]>();
    for (const teacher of teacherProfiles) {
      teacherVectors.set(
        teacher.userId,
        this.extractTerms([
          teacher.subjects,
          teacher.experience,
          teacher.availability,
          teacher.bio,
        ]),
      );
    }

    const studentVectors = new Map<string, string[]>();
    for (const profile of studentProfiles) {
      studentVectors.set(
        profile.userId,
        this.extractTerms([
          profile.preferredSubjects,
          profile.learningGoals,
          profile.interests,
        ]),
      );
    }

    const studentVector = studentVectors.get(studentId) ?? [];
    const studentHistoryBookings = bookings.filter(
      (booking) => booking.studentId === studentId,
    );
    const historicalTeacherIds = new Set(
      studentHistoryBookings.map((booking) => booking.teacherId),
    );
    const historicalReviews = new Map(
      reviews
        .filter((review) => review.studentId === studentId)
        .map((review) => [review.teacherId, review.rating]),
    );

    const scoredTeachers: Array<{ teacherId: string; score: number }> = [];

    for (const teacher of teacherProfiles) {
      if (historicalTeacherIds.has(teacher.userId)) {
        continue;
      }

      const candidateVector = teacherVectors.get(teacher.userId) ?? [];
      const contentScore = this.cosineSimilarity(
        studentVector,
        candidateVector,
      );
      const userBasedCf = this.computeUserBasedCf(
        studentId,
        teacher.userId,
        studentVectors,
        bookings,
        reviews,
        teacherProfiles,
      );
      const itemBasedCf = this.computeItemBasedCf(
        studentId,
        teacher.userId,
        teacherVectors,
        bookings,
        reviews,
      );
      const ratingBoost = Number(teacher.rating ?? 0) / 5;
      const popularityBoost = Math.min(
        1,
        Number(teacher.totalReviews ?? 0) / 10,
      );

      const finalScore =
        0.4 * userBasedCf +
        0.35 * itemBasedCf +
        0.15 * contentScore +
        0.05 * ratingBoost +
        0.05 * popularityBoost;
      scoredTeachers.push({ teacherId: teacher.userId, score: finalScore });
    }

    scoredTeachers.sort((left, right) => right.score - left.score);
    const topTeachers = scoredTeachers.slice(0, 10);

    const items = await Promise.all(
      topTeachers.map(async ({ teacherId, score }) => {
        const teacher = await this.teacherProfileModel
          .findOne({ userId: teacherId })
          .lean()
          .exec();
        const user = await this.userModel.findById(teacherId).lean().exec();
        return { teacher, user, score };
      }),
    );

    return {
      items,
      meta: {
        page: 1,
        limit: 10,
        total: items.length,
        pages: Math.ceil(items.length / 10),
      },
    };
  }

  private buildDocumentFrequency(corpusTerms: string[][]) {
    const documentFrequency = new Map<string, number>();

    for (const terms of corpusTerms) {
      const uniqueTerms = new Set(terms);
      for (const term of uniqueTerms) {
        documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
      }
    }

    return documentFrequency;
  }

  private extractTerms(
    values: Array<string | string[] | undefined | null>,
  ): string[] {
    const tokens = new Set<string>();

    for (const value of values) {
      if (!value) {
        continue;
      }

      const raw = Array.isArray(value) ? value.join(' ') : String(value);
      const normalized = raw.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

      for (const token of normalized.split(/\s+/).filter(Boolean)) {
        if (token.length > 1) {
          tokens.add(token);
        }
      }
    }

    return Array.from(tokens);
  }

  private calculateBm25Score(
    documentTerms: string[],
    queryTerms: string[],
    documentFrequency: Map<string, number>,
    avgDocLength: number,
    totalDocuments: number,
  ) {
    const k1 = 1.5;
    const b = 0.75;
    const documentLength = documentTerms.length;
    const frequency = new Map<string, number>();

    for (const term of documentTerms) {
      frequency.set(term, (frequency.get(term) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTerms) {
      if (!term) {
        continue;
      }

      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log((totalDocuments - df + 0.5) / (df + 0.5) + 1);
      const tf = frequency.get(term) ?? 0;

      if (tf === 0) {
        continue;
      }

      const numerator = tf * (k1 + 1);
      const denominator =
        tf + k1 * (1 - b + b * (documentLength / Math.max(avgDocLength, 1)));
      score += idf * (numerator / denominator);
    }

    return score;
  }

  private computeUserBasedCf(
    currentStudentId: string,
    targetTeacherId: string,
    studentVectors: Map<string, string[]>,
    bookings: BookingLike[],
    reviews: ReviewLike[],
    teacherProfiles: TeacherProfileLike[],
  ) {
    const currentVector = studentVectors.get(currentStudentId) ?? [];
    const neighborScores: Array<{ similarity: number; rating: number }> = [];

    for (const profile of teacherProfiles) {
      continue;
    }

    for (const otherStudent of studentVectors.keys()) {
      if (otherStudent === currentStudentId) {
        continue;
      }

      const similarity = this.cosineSimilarity(
        currentVector,
        studentVectors.get(otherStudent) ?? [],
      );
      const peerBookings = bookings.filter(
        (booking) =>
          booking.studentId === otherStudent &&
          booking.teacherId === targetTeacherId,
      );

      if (peerBookings.length === 0 || similarity === 0) {
        continue;
      }

      const avgPeerRating = this.averageRatingForStudent(otherStudent, reviews);
      const peerRating = this.ratingForTeacher(
        otherStudent,
        targetTeacherId,
        reviews,
      );
      neighborScores.push({ similarity, rating: peerRating - avgPeerRating });
    }

    if (neighborScores.length === 0) {
      return 0;
    }

    const numerator = neighborScores.reduce(
      (sum, item) => sum + item.similarity * item.rating,
      0,
    );
    const denominator = neighborScores.reduce(
      (sum, item) => sum + Math.abs(item.similarity),
      0,
    );
    return denominator === 0
      ? 0
      : Math.max(0, Math.min(1, numerator / denominator + 0.5));
  }

  private computeItemBasedCf(
    currentStudentId: string,
    targetTeacherId: string,
    teacherVectors: Map<string, string[]>,
    bookings: BookingLike[],
    reviews: ReviewLike[],
  ) {
    const studentHistory = bookings.filter(
      (booking) => booking.studentId === currentStudentId,
    );
    const weightedScores: Array<{ similarity: number; rating: number }> = [];

    for (const booking of studentHistory) {
      const historicalTeacherId = booking.teacherId;
      const similarity = this.cosineSimilarity(
        teacherVectors.get(historicalTeacherId) ?? [],
        teacherVectors.get(targetTeacherId) ?? [],
      );

      if (similarity === 0) {
        continue;
      }

      const rating = this.ratingForTeacher(
        currentStudentId,
        historicalTeacherId,
        reviews,
      );
      weightedScores.push({ similarity, rating });
    }

    if (weightedScores.length === 0) {
      return 0;
    }

    const numerator = weightedScores.reduce(
      (sum, item) => sum + item.similarity * item.rating,
      0,
    );
    const denominator = weightedScores.reduce(
      (sum, item) => sum + Math.abs(item.similarity),
      0,
    );
    return denominator === 0
      ? 0
      : Math.max(0, Math.min(1, numerator / denominator / 5));
  }

  private averageRatingForStudent(studentId: string, reviews: ReviewLike[]) {
    const studentReviews = reviews.filter(
      (review) => review.studentId === studentId,
    );
    if (studentReviews.length === 0) {
      return 0;
    }

    const total = studentReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return total / studentReviews.length;
  }

  private ratingForTeacher(
    studentId: string,
    teacherId: string,
    reviews: ReviewLike[],
  ) {
    const review = reviews.find(
      (item) => item.studentId === studentId && item.teacherId === teacherId,
    );
    return review?.rating ?? 3;
  }

  private cosineSimilarity(left: string[], right: string[]) {
    const leftSet = new Set(left);
    const rightSet = new Set(right);
    const intersection = [...leftSet].filter((item) =>
      rightSet.has(item),
    ).length;
    const denominator = Math.sqrt(leftSet.size * rightSet.size);

    if (denominator === 0) {
      return 0;
    }

    return intersection / denominator;
  }
}
