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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
import { PackagesService } from '../services/packages.service';

@ApiTags('Packages')
@ApiBearerAuth('JWT')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  @ApiResponse({ status: 200, description: 'Packages returned' })
  getAllPackages() {
    return this.packagesService.getAllPackages();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a teaching package' })
  @ApiBody({
    schema: {
      example: {
        name: 'Crash Course Mathematics',
        description: '12 sessions of focused exam preparation',
        price: 8500,
        durationInHours: 2,
        sessions: 12,
        isActive: true,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Package created' })
  createPackage(
    @CurrentUser('sub') teacherId: string,
    @Body() createPackageDto: CreatePackageDto,
  ) {
    return this.packagesService.createPackage(teacherId, createPackageDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current teacher packages' })
  @ApiResponse({ status: 200, description: 'Teacher packages returned' })
  getMyPackages(@CurrentUser('sub') teacherId: string) {
    return this.packagesService.getPackagesForTeacher(teacherId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get packages for a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher packages returned' })
  getPackagesForTeacher(@Param('teacherId') teacherId: string) {
    return this.packagesService.getPackagesForTeacher(teacherId);
  }

  @Patch(':packageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a package' })
  @ApiBody({
    schema: {
      example: {
        price: 9000,
        isActive: false,
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Package updated' })
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
  @ApiOperation({ summary: 'Delete a package' })
  @ApiResponse({ status: 200, description: 'Package deleted' })
  deletePackage(
    @CurrentUser('sub') teacherId: string,
    @Param('packageId') packageId: string,
  ) {
    return this.packagesService.deletePackage(teacherId, packageId);
  }

  @Get(':packageId')
  @ApiOperation({ summary: 'Get package by id' })
  @ApiResponse({ status: 200, description: 'Package returned' })
  getPackageById(@Param('packageId') packageId: string) {
    return this.packagesService.getPackageById(packageId);
  }
}
