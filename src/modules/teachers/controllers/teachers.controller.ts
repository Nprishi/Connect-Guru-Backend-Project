import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTeacherProfileDto } from '../dto/create-teacher-profile.dto';
import { TeachersService } from '../services/teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  createOrUpdateProfile(
    @CurrentUser('sub') userId: string,
    @Body() createTeacherProfileDto: CreateTeacherProfileDto,
  ) {
    return this.teachersService.createOrUpdateProfile(
      userId,
      createTeacherProfileDto,
    );
  }

  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.teachersService.getProfile(userId);
  }

  @Get()
  searchTeachers(
    @Query('subject') subject?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.teachersService.searchTeachers({ subject, page, limit });
  }
}
