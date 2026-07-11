/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Post } from '@nestjs/common';
import { SuperAdminLoginDto } from '../dto/super-admin-login.dto';
import { AuthService } from '../services/auth.service';

@Controller('superadmin/t1')
export class SuperAdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: SuperAdminLoginDto) {
    return this.authService.superAdminLogin(dto);
  }
}
