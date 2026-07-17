import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student analytics dashboard summary' })
  @ApiResponse({ status: 200, description: 'Student analytics returned' })
  getStudentAnalytics(@CurrentUser('sub') studentId: string) {
    return this.analyticsService.getStudentAnalytics(studentId);
  }

  @Get('teacher')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher analytics dashboard summary' })
  @ApiResponse({ status: 200, description: 'Teacher analytics returned' })
  getTeacherAnalytics(@CurrentUser('sub') teacherId: string) {
    return this.analyticsService.getTeacherAnalytics(teacherId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin analytics dashboard summary' })
  @ApiResponse({ status: 200, description: 'Admin analytics returned' })
  getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }
}
