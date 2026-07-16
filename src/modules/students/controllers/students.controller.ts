/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import { StudentsService } from '../services/students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
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
  patchProfile(
    @CurrentUser('sub') userId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.studentsService.updateProfile(userId, payload);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser('sub') userId: string) {
    return this.studentsService.getMe(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@CurrentUser('sub') userId: string) {
    return this.studentsService.getDashboard(userId);
  }

  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.studentsService.getProfile(userId);
  }
}
