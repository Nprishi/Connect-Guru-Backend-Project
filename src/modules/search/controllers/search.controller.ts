import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PackageSearchDto } from '../dto/package-search.dto';
import { TeacherSearchDto } from '../dto/teacher-search.dto';
import { SearchService } from '../services/search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Global search using BM25-style ranking' })
  @ApiResponse({ status: 200, description: 'Global search results returned' })
  globalSearch(@Query('q') query: string) {
    return this.searchService.globalSearch(query);
  }

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

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get personalized teacher recommendations for the current student using collaborative filtering',
  })
  @ApiResponse({ status: 200, description: 'Recommended teachers returned' })
  getRecommendations(@CurrentUser('sub') studentId: string) {
    return this.searchService.recommendTeachers(studentId);
  }
}
