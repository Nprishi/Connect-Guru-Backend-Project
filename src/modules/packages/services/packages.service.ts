import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreatePackageDto } from '../dto/create-package.dto';
import { PackageDocument, PackageItem } from '../schema/package.schema';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(PackageItem.name)
    private readonly packageModel: Model<PackageDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createPackage(teacherId: string, dto: CreatePackageDto) {
    const teacher = await this.usersService.findById(teacherId);

    if (!teacher) {
      throw new UnauthorizedException('Teacher not found.');
    }

    return this.packageModel.create({ teacherId, ...dto });
  }

  async getPackagesForTeacher(teacherId: string) {
    return this.packageModel.find({ teacherId, isActive: true }).exec();
  }

  async getPackageById(packageId: string) {
    const pkg = await this.packageModel.findById(packageId).exec();

    if (!pkg) {
      throw new NotFoundException('Package not found.');
    }

    return pkg;
  }
}
