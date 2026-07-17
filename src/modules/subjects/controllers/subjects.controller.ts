import {
  Body,
  Controller,
  Delete,
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

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectsService } from '../services/subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a subject' })
  @ApiResponse({ status: 201, description: 'Subject created' })
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subjects with pagination' })
  @ApiResponse({ status: 200, description: 'Subjects returned' })
  getSubjects(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.subjectsService.getSubjects(Number(page), Number(limit));
  }

  @Get(':subjectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subject by id' })
  @ApiResponse({ status: 200, description: 'Subject returned' })
  getSubjectById(@Param('subjectId') subjectId: string) {
    return this.subjectsService.getSubjectById(subjectId);
  }

  @Patch(':subjectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subject' })
  @ApiResponse({ status: 200, description: 'Subject updated' })
  updateSubject(
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.updateSubject(subjectId, dto);
  }

  @Delete(':subjectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiResponse({ status: 200, description: 'Subject deleted' })
  deleteSubject(@Param('subjectId') subjectId: string) {
    return this.subjectsService.deleteSubject(subjectId);
  }
}
