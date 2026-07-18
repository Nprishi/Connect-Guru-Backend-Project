/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthService } from '../../auth/services/auth.service';
import { AdminQueryDto } from '../dto/admin-query.dto';
import {
  AnnouncementAudience,
  CreateAnnouncementDto,
} from '../dto/announcement.dto';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { SystemSettingsDto } from '../dto/system-settings.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { SuperAdminService } from '../services/super-admin.service';

@ApiTags('Super Admin')
@ApiBearerAuth('JWT')
@Controller('superadmin')
export class SuperAdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly superAdminService: SuperAdminService,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get super admin dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard returned' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getDashboard() {
    return this.superAdminService.getDashboard();
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get paginated admin directory' })
  @ApiResponse({ status: 200, description: 'Admins returned' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended'],
  })
  getAdmins(@Query() query: AdminQueryDto) {
    return this.superAdminService.getAdmins(query);
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new admin account' })
  @ApiResponse({ status: 201, description: 'Admin created' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  createAdmin(
    @CurrentUser('sub') actorId: string,
    @Body() dto: CreateAdminDto,
  ) {
    return this.superAdminService.createAdmin(actorId, dto);
  }

  @Get('admins/:adminId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get complete admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile returned' })
  @ApiParam({
    name: 'adminId',
    type: String,
    description: 'Admin Mongo ObjectId',
  })
  getAdminById(@Param('adminId') adminId: string) {
    return this.superAdminService.getAdminById(adminId);
  }

  @Patch('admins/:adminId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admin profile details' })
  @ApiResponse({ status: 200, description: 'Admin updated' })
  @ApiParam({
    name: 'adminId',
    type: String,
    description: 'Admin Mongo ObjectId',
  })
  updateAdmin(
    @CurrentUser('sub') actorId: string,
    @Param('adminId') adminId: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.superAdminService.updateAdmin(actorId, adminId, dto);
  }

  @Delete('admins/:adminId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete an admin account' })
  @ApiResponse({ status: 200, description: 'Admin soft deleted' })
  @ApiParam({
    name: 'adminId',
    type: String,
    description: 'Admin Mongo ObjectId',
  })
  deleteAdmin(
    @CurrentUser('sub') actorId: string,
    @Param('adminId') adminId: string,
  ) {
    return this.superAdminService.deleteAdmin(actorId, adminId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get global platform analytics' })
  @ApiResponse({ status: 200, description: 'Analytics returned' })
  getAnalytics() {
    return this.superAdminService.getAnalytics();
  }

  @Get('system-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform system settings' })
  @ApiResponse({ status: 200, description: 'Settings returned' })
  getSystemSettings() {
    return this.superAdminService.getSystemSettings();
  }

  @Patch('system-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update platform system settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  updateSystemSettings(
    @CurrentUser('sub') actorId: string,
    @Body() dto: SystemSettingsDto,
  ) {
    return this.superAdminService.updateSystemSettings(actorId, dto);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit logs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Audit logs returned' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'adminId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  getAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('adminId') adminId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.superAdminService.getAuditLogs({
      page,
      limit,
      search,
      action,
      adminId,
      fromDate,
      toDate,
    });
  }

  @Post('database/backup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a MongoDB database backup' })
  @ApiResponse({ status: 201, description: 'Backup created' })
  createBackup(@CurrentUser('sub') actorId: string) {
    return this.superAdminService.createBackup(actorId);
  }

  @Get('database/backups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List MongoDB database backups' })
  @ApiResponse({ status: 200, description: 'Backups listed' })
  listBackups() {
    return this.superAdminService.listBackups();
  }

  @Post('database/restore/:backupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Restore a MongoDB database backup' })
  @ApiResponse({ status: 200, description: 'Backup restored' })
  @ApiParam({
    name: 'backupId',
    type: String,
    description: 'Backup identifier',
  })
  restoreBackup(
    @CurrentUser('sub') actorId: string,
    @Param('backupId') backupId: string,
  ) {
    return this.superAdminService.restoreBackup(actorId, backupId);
  }

  @Post('announcements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Broadcast a global platform announcement' })
  @ApiResponse({ status: 201, description: 'Announcement broadcasted' })
  broadcastAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.superAdminService.broadcastAnnouncement(dto);
  }
}
