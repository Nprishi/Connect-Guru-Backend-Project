import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PackageSearchDto } from '../dto/package-search.dto';
import { TeacherSearchDto } from '../dto/teacher-search.dto';
import { SearchService } from '../services/search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('teachers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search teachers with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Teacher results returned' })
  searchTeachers(@Query() dto: TeacherSearchDto) {
    return this.searchService.searchTeachers(dto);
  }

  @Get('packages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search packages' })
  @ApiResponse({ status: 200, description: 'Package search results returned' })
  searchPackages(@Query() dto: PackageSearchDto) {
    return this.searchService.searchPackages(dto);
  }
}
