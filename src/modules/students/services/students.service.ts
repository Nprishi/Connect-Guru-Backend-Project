import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../schema/student-profile.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createOrUpdateProfile(userId: string, dto: CreateStudentProfileDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const existingProfile = await this.studentProfileModel.findOne({ userId });

    if (existingProfile) {
      return this.studentProfileModel.findOneAndUpdate(
        { userId },
        { $set: dto },
        { new: true },
      );
    }

    return this.studentProfileModel.create({ userId, ...dto });
  }

  async getProfile(userId: string) {
    const profile = await this.studentProfileModel.findOne({ userId });

    if (!profile) {
      throw new NotFoundException('Student profile not found.');
    }

    return profile;
  }
}
