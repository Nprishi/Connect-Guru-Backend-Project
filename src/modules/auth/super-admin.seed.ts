/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/services/users.service';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class SuperAdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const email = String(process.env.Super_email);
    const password = String(process.env.Super_password);
    const secretKey = String(process.env.Super_secretKey);

    const existing = await this.usersService.findByEmail(email, true, true);

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecretKey = await bcrypt.hash(secretKey, 10);

    if (existing) {
      await this.usersService.updatePassword(existing.id, hashedPassword);
      await this.usersService.updateSuperAdminSecret(
        existing.id,
        hashedSecretKey,
      );
      this.logger.log('Super admin password and secret were updated.');
      return;
    }

    await this.usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      gender: 'male' as any,
      phone: '0000000000',
      status: 'active' as any,
      superAdminSecret: hashedSecretKey,
    });

    this.logger.log('Super admin account created.');
  }
}
