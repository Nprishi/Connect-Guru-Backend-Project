import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
import { PackageDocument, PackageItem } from '../schema/package.schema';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(PackageItem.name)
    private readonly packageModel: Model<PackageDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getAllPackages() {
    return this.packageModel.find({ isActive: true }).exec();
  }

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

  async updatePackage(
    teacherId: string,
    packageId: string,
    dto: UpdatePackageDto,
  ) {
    const pkg = await this.packageModel.findById(packageId).exec();

    if (!pkg) {
      throw new NotFoundException('Package not found.');
    }

    if (String(pkg.teacherId) !== String(teacherId)) {
      throw new UnauthorizedException(
        'You are not authorized to update this package.',
      );
    }

    const updated = await this.packageModel
      .findByIdAndUpdate(packageId, dto, { new: true })
      .exec();

    return updated;
  }

  async deletePackage(teacherId: string, packageId: string) {
    const pkg = await this.packageModel.findById(packageId).exec();

    if (!pkg) {
      throw new NotFoundException('Package not found.');
    }

    if (String(pkg.teacherId) !== String(teacherId)) {
      throw new UnauthorizedException(
        'You are not authorized to delete this package.',
      );
    }

    await this.packageModel.findByIdAndDelete(packageId).exec();

    return { message: 'Package deleted successfully' };
  }

  async getPackageById(packageId: string) {
    const pkg = await this.packageModel.findById(packageId).exec();

    if (!pkg) {
      throw new NotFoundException('Package not found.');
    }

    return pkg;
  }
}
