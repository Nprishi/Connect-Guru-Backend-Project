/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { UsersService } from '../../users/services/users.service';
import { AUTH_CONSTANTS } from '../auth.constants';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SuperAdminLoginDto } from '../dto/super-admin-login.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { AuthEmailService } from './auth-email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authEmailService: AuthEmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin registration is not allowed.');
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    const existingPhoneUser = await this.usersService.findByPhone(
      registerDto.phone,
    );

    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }

    if (existingPhoneUser) {
      throw new ConflictException('Phone number already registered.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const createdUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      isEmailVerified: false,
      settings: {
        notifications: true,
        emailUpdates: true,
      },
    });

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.usersService.updateEmailVerificationTokens(
      createdUser.id,
      otpHash,
      otpExpiresAt,
      new Date(),
    );

    await this.authEmailService.sendVerificationOtp(createdUser.email, otp);
    await this.notificationsService.notifyUserRegistered(createdUser.id);

    const { accessToken, refreshToken } =
      await this.generateTokens(createdUser);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(
      createdUser.id,
      hashedRefreshToken,
    );

    return {
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: this.sanitizeUser(createdUser),
        accessToken,
        refreshToken,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    await this.usersService.updateLastLogin(user.id);
    await this.notificationsService.notifyUserLoggedIn(user.id);

    return {
      message: 'Login successful.',
      data: {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    };
  }

  async superAdminLogin(superAdminLoginDto: SuperAdminLoginDto) {
    const superAdmin = await this.usersService.findByEmail(
      superAdminLoginDto.email,
      true,
      true,
    );

    if (!superAdmin || superAdmin.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(
      superAdminLoginDto.password,
      superAdmin.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!superAdmin.superAdminSecret) {
      throw new UnauthorizedException('Super admin secret is not configured.');
    }

    const isSecretValid = await bcrypt.compare(
      superAdminLoginDto.secretKey,
      superAdmin.superAdminSecret,
    );

    if (!isSecretValid) {
      throw new UnauthorizedException('Invalid secret key.');
    }

    const { accessToken, refreshToken } = await this.generateTokens(superAdmin);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(
      superAdmin.id,
      hashedRefreshToken,
    );
    await this.usersService.updateLastLogin(superAdmin.id);

    return {
      message: 'Super admin login successful.',
      data: {
        user: this.sanitizeUser(superAdmin),
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(refreshTokenDto.refreshToken);
    const user = await this.usersService.findById(payload.sub, true);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      message: 'Tokens refreshed successfully.',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const token = await bcrypt.hash(
      `${user.id}-${Date.now()}-${Math.random()}`,
      10,
    );
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.setResetPasswordToken(user.id, token, expiresAt);

    return {
      message: 'Password reset link generated successfully.',
      data: {
        token,
        expiresAt,
      },
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(
      '',
      false,
      false,
      false,
      true,
    );

    if (!user?.resetPasswordToken) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    const isTokenValid = await bcrypt.compare(
      dto.token,
      user.resetPasswordToken,
    );

    if (
      !isTokenValid ||
      !user.resetPasswordExpiresAt ||
      user.resetPasswordExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.setResetPasswordToken(
      user.id,
      null as unknown as string,
      new Date(0),
    );

    return {
      message: 'Password reset successfully.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId, false, false, false);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password changed successfully.',
    };
  }

  async sendVerificationOtp(userId: string) {
    const user = await this.usersService.findById(userId, false, true);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const lastSentAt = user.emailVerificationLastSentAt;
    if (lastSentAt && Date.now() - lastSentAt.getTime() < 60 * 1000) {
      throw new UnauthorizedException(
        'Please wait 60 seconds before requesting a new OTP.',
      );
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.usersService.updateEmailVerificationTokens(
      user.id,
      otpHash,
      otpExpiresAt,
      new Date(),
    );

    await this.authEmailService.sendVerificationOtp(user.email, otp);

    return {
      message: 'Verification OTP sent successfully.',
    };
  }

  async verifyEmail(userId: string, dto: VerifyEmailDto) {
    const user = await this.usersService.findById(userId, false, true);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
      throw new UnauthorizedException('No active verification request found.');
    }

    if (user.emailVerificationAttempts >= 5) {
      throw new UnauthorizedException(
        'Too many failed attempts. Request a new OTP.',
      );
    }

    if (user.emailVerificationOtpExpiresAt < new Date()) {
      throw new UnauthorizedException('Verification OTP has expired.');
    }

    const isOtpValid = await bcrypt.compare(
      dto.otp,
      user.emailVerificationOtpHash,
    );

    if (!isOtpValid) {
      await this.usersService.updateEmailVerificationTokens(
        user.id,
        user.emailVerificationOtpHash,
        user.emailVerificationOtpExpiresAt,
        user.emailVerificationLastSentAt,
      );
      throw new UnauthorizedException('Invalid OTP.');
    }

    await this.usersService.markEmailVerified(user.id);

    return {
      message: 'Email verified successfully.',
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);

    return {
      message: 'Logout successful.',
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return {
      message: 'Profile fetched successfully.',
      data: {
        user: this.sanitizeUser(user),
      },
    };
  }

  private async generateTokens(user: {
    id?: string;
    _id?: { toString(): string };
    email: string;
    role: string;
  }) {
    const payload: JwtPayload = {
      sub: user.id ?? user._id?.toString() ?? '',
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private generateOtp() {
    return randomInt(100000, 999999).toString();
  }

  private sanitizeUser(user: unknown) {
    const userObject =
      typeof user === 'object' &&
      user !== null &&
      'toObject' in user &&
      typeof (user as { toObject?: () => Record<string, unknown> }).toObject ===
        'function'
        ? (user as { toObject: () => Record<string, unknown> }).toObject()
        : (user as Record<string, unknown>);

    const { password, refreshToken, superAdminSecret, ...safeUser } =
      userObject;

    return safeUser;
  }
}
