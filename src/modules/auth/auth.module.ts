import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AuditLog, AuditLogSchema } from '../super-admin/schema/audit-log.schema';
import { AuthController } from './controllers/auth.controller';
import { AUTH_CONSTANTS } from './auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthEmailService } from './services/auth-email.service';
import { AuthService } from './services/auth.service';
import { SuperAdminSeeder } from './super-admin.seed';

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    AuthEmailService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    SuperAdminSeeder,
  ],

  exports: [AuthService],
})
export class AuthModule {}
