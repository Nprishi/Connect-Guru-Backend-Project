import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePackageDto } from '../dto/create-package.dto';
import { PackagesService } from '../services/packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPackage(
    @CurrentUser('sub') teacherId: string,
    @Body() createPackageDto: CreatePackageDto,
  ) {
    return this.packagesService.createPackage(teacherId, createPackageDto);
  }

  @Get('teacher/:teacherId')
  getPackagesForTeacher(@Param('teacherId') teacherId: string) {
    return this.packagesService.getPackagesForTeacher(teacherId);
  }

  @Get(':packageId')
  getPackageById(@Param('packageId') packageId: string) {
    return this.packagesService.getPackageById(packageId);
  }
}
