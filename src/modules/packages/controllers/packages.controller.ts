import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
import { PackagesService } from '../services/packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  getAllPackages() {
    return this.packagesService.getAllPackages();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createPackage(
    @CurrentUser('sub') teacherId: string,
    @Body() createPackageDto: CreatePackageDto,
  ) {
    return this.packagesService.createPackage(teacherId, createPackageDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyPackages(@CurrentUser('sub') teacherId: string) {
    return this.packagesService.getPackagesForTeacher(teacherId);
  }

  @Get('teacher/:teacherId')
  getPackagesForTeacher(@Param('teacherId') teacherId: string) {
    return this.packagesService.getPackagesForTeacher(teacherId);
  }

  @Patch(':packageId')
  @UseGuards(JwtAuthGuard)
  updatePackage(
    @CurrentUser('sub') teacherId: string,
    @Param('packageId') packageId: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.updatePackage(
      teacherId,
      packageId,
      updatePackageDto,
    );
  }

  @Delete(':packageId')
  @UseGuards(JwtAuthGuard)
  deletePackage(
    @CurrentUser('sub') teacherId: string,
    @Param('packageId') packageId: string,
  ) {
    return this.packagesService.deletePackage(teacherId, packageId);
  }

  @Get(':packageId')
  getPackageById(@Param('packageId') packageId: string) {
    return this.packagesService.getPackageById(packageId);
  }
}
