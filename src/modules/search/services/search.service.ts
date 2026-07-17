import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PackageItem, PackageDocument } from '../../packages/schema/package.schema';
import { TeacherProfile, TeacherProfileDocument } from '../../teachers/schema/teacher-profile.schema';
import { User, UserDocument } from '../../users/schema/user.schema';
import { PackageSearchDto } from '../dto/package-search.dto';
import { TeacherSearchDto } from '../dto/teacher-search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PackageItem.name)
    private readonly packageModel: Model<PackageDocument>,
  ) {}

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

    const sort: Record<string, 1 | -1> = { createdAt: -1 };

    if (dto.sort) {
      const [field, direction] = dto.sort.split(':');
      if (field === 'price') {
        sort.hourlyRate = direction === 'asc' ? 1 : -1;
      }
      if (field === 'rating') {
        sort.rating = direction === 'asc' ? 1 : -1;
      }
      if (field === 'newest') {
        sort.createdAt = direction === 'asc' ? 1 : -1;
      }
    }

    const [profiles, total] = await Promise.all([
      this.teacherProfileModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.teacherProfileModel.countDocuments(filter),
    ]);

    const items = await Promise.all(
      profiles.map(async (profile) => {
        const user = await this.userModel.findById(profile.userId).lean().exec();
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
}
