import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTeacherProfileDto } from '../dto/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from '../dto/update-teacher-profile.dto';
import { TeacherSearchDto } from '../../search/dto/teacher-search.dto';
import { TeachersService } from '../services/teachers.service';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update teacher profile' })
  @ApiResponse({ status: 200, description: 'Teacher profile created or updated' })
  createOrUpdateProfile(
    @CurrentUser('sub') userId: string,
    @Body() createTeacherProfileDto: CreateTeacherProfileDto,
  ) {
    return this.teachersService.createOrUpdateProfile(
      userId,
      createTeacherProfileDto,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patch teacher profile' })
  @ApiResponse({ status: 200, description: 'Teacher profile patched' })
  patchProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTeacherProfileDto,
  ) {
    return this.teachersService.updateProfile(userId, dto);
  }

  @Patch('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update teacher availability' })
  @ApiResponse({ status: 200, description: 'Availability updated' })
  updateAvailability(
    @CurrentUser('sub') userId: string,
    @Body('availability') availability: string[],
  ) {
    return this.teachersService.updateAvailability(userId, availability);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current teacher profile' })
  @ApiResponse({ status: 200, description: 'Current teacher returned' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.teachersService.getMe(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher dashboard summary' })
  @ApiResponse({ status: 200, description: 'Teacher dashboard returned' })
  getDashboard(@CurrentUser('sub') userId: string) {
    return this.teachersService.getDashboard(userId);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher students list' })
  @ApiResponse({ status: 200, description: 'Students list returned' })
  getStudents(@CurrentUser('sub') userId: string) {
    return this.teachersService.getStudents(userId);
  }

  @Get('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher reviews' })
  @ApiResponse({ status: 200, description: 'Reviews returned' })
  getReviews(@CurrentUser('sub') userId: string) {
    return this.teachersService.getReviews(userId);
  }

  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.teachersService.getProfile(userId);
  }

  @Get()
  searchTeachers(@Query() dto: TeacherSearchDto) {
    return this.teachersService.searchTeachers(dto);
  }
}
