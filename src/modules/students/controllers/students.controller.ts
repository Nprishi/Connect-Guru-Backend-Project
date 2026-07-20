import {
  Body,
  Controller,
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
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';
import { StudentsService } from '../services/students.service';

@ApiTags('Students')
@ApiBearerAuth('JWT')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update student profile' })
  @ApiBody({
    schema: {
      example: {
        preferredSubjects: ['Mathematics', 'Physics'],
        learningGoals: ['Improve calculus'],
        interests: ['Science Olympiad'],
        bio: 'Curious learner interested in STEM topics',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Student profile created' })
  createOrUpdateProfile(
    @CurrentUser('sub') userId: string,
    @Body() createStudentProfileDto: CreateStudentProfileDto,
  ) {
    return this.studentsService.createOrUpdateProfile(
      userId,
      createStudentProfileDto,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Patch student profile' })
  @ApiBody({
    schema: {
      example: {
        bio: 'Updated bio for advanced learning goals',
        learningGoals: ['Prepare for final exams'],
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Student profile updated' })
  patchProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentsService.updateProfile(userId, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiResponse({ status: 200, description: 'Student profile returned' })
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.studentsService.getMe(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current student details' })
  @ApiResponse({ status: 200, description: 'Student details returned' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.studentsService.getMe(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard returned' })
  getDashboard(@CurrentUser('sub') userId: string) {
    return this.studentsService.getDashboard(userId);
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get a student profile by user id' })
  @ApiResponse({ status: 200, description: 'Student profile returned' })
  getProfile(@Param('userId') userId: string) {
    return this.studentsService.getProfile(userId);
  }
}
