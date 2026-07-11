import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreateTeacherProfileDto } from '../dto/create-teacher-profile.dto';
import {
  TeacherProfile,
  TeacherProfileDocument,
} from '../schema/teacher-profile.schema';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createOrUpdateProfile(userId: string, dto: CreateTeacherProfileDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const existingProfile = await this.teacherProfileModel.findOne({ userId });

    if (existingProfile) {
      return this.teacherProfileModel.findOneAndUpdate(
        { userId },
        { $set: dto },
        { new: true },
      );
    }

    return this.teacherProfileModel.create({ userId, ...dto });
  }

  async getProfile(userId: string) {
    const profile = await this.teacherProfileModel.findOne({ userId });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    return profile;
  }

  async searchTeachers(query: {
    subject?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.subject) {
      filter.subjects = { $in: [new RegExp(query.subject, 'i')] };
    }

    const profiles = await this.teacherProfileModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const teachers = await Promise.all(
      profiles.map(async (profile) => {
        const user = await this.usersService.findById(profile.userId);

        return {
          profile,
          user,
        };
      }),
    );

    return {
      teachers,
      page,
      limit,
    };
  }
}
