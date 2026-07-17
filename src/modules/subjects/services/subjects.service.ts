import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectItem, SubjectDocument } from '../schema/subject.schema';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(SubjectItem.name)
    private readonly subjectModel: Model<SubjectDocument>,
  ) {}

  async createSubject(dto: CreateSubjectDto) {
    return this.subjectModel.create(dto);
  }

  async getSubjects(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.subjectModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.subjectModel.countDocuments(),
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

  async getSubjectById(subjectId: string) {
    const subject = await this.subjectModel.findById(subjectId).exec();
    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }
    return subject;
  }

  async updateSubject(subjectId: string, dto: UpdateSubjectDto) {
    const subject = await this.subjectModel.findByIdAndUpdate(
      subjectId,
      { $set: dto },
      { new: true },
    );

    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }

    return subject;
  }

  async deleteSubject(subjectId: string) {
    const subject = await this.subjectModel.findByIdAndDelete(subjectId).exec();
    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }

    return { success: true, message: 'Subject deleted successfully.' };
  }
}
