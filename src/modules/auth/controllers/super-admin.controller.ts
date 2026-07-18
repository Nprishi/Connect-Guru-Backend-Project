import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SuperAdminLoginDto } from '../dto/super-admin-login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Super Admin')
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Super admin login' })
  @ApiResponse({ status: 200, description: 'Super admin logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or secret' })
  login(@Body() dto: SuperAdminLoginDto, @Req() req: Request) {
    return this.authService.superAdminLogin(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ?? 'Unknown',
    });
  }
}
