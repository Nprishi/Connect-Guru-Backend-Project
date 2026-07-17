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
import { CreateSessionDto } from '../dto/create-session.dto';
import { SessionsService } from '../services/sessions.service';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a session from an accepted booking' })
  @ApiResponse({ status: 201, description: 'Session created' })
  createSession(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.createSession(teacherId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sessions with pagination' })
  @ApiResponse({ status: 200, description: 'Sessions returned' })
  getSessions(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.sessionsService.getSessions(Number(page), Number(limit));
  }

  @Get('student')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sessions for the current student' })
  @ApiResponse({ status: 200, description: 'Student sessions returned' })
  getStudentSessions(
    @CurrentUser('sub') studentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.sessionsService.getStudentSessions(
      studentId,
      Number(page),
      Number(limit),
    );
  }

  @Get('teacher')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sessions for the current teacher' })
  @ApiResponse({ status: 200, description: 'Teacher sessions returned' })
  getTeacherSessions(
    @CurrentUser('sub') teacherId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.sessionsService.getTeacherSessions(
      teacherId,
      Number(page),
      Number(limit),
    );
  }

  @Patch(':sessionId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a session' })
  @ApiResponse({ status: 200, description: 'Session started' })
  startSession(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.startSession(sessionId, teacherId);
  }

  @Patch(':sessionId/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a session' })
  @ApiResponse({ status: 200, description: 'Session ended' })
  endSession(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.endSession(sessionId, teacherId);
  }

  @Patch(':sessionId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiResponse({ status: 200, description: 'Session cancelled' })
  cancelSession(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.cancelSession(sessionId, teacherId);
  }
}
