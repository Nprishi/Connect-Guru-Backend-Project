/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/services/users.service';

import { Gender } from '../auth/enums/gender.enum';
import { UserRole } from '../auth/enums/user-role.enum';
import { UserStatus } from '../auth/enums/user-status.enum';

@Injectable()
export class SuperAdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const password = this.configService.get<string>('SUPER_ADMIN_PASSWORD');
    const secretKey = this.configService.get<string>('SUPER_ADMIN_SECRET_KEY');

    if (!email || !password || !secretKey) {
      this.logger.error('Super Admin environment variables are missing.');
      return;
    }

    const existing = await this.usersService.findByEmail(email, true, true);

    if (existing) {
      this.logger.log('Super Admin already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecretKey = await bcrypt.hash(secretKey, 10);

    await this.usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      gender: Gender.MALE,
      phone: '+9779800000000',
      status: UserStatus.ACTIVE,
      superAdminSecret: hashedSecretKey,
    });

    this.logger.log('Super Admin account created successfully.');
  }
}
