import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../../users/services/users.service';
import { AUTH_CONSTANTS } from '../auth.constants';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { SuperAdminLoginDto } from '../dto/super-admin-login.dto';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin registration is not allowed.');
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    const existingPhoneUser = await this.usersService.findByPhone(registerDto.phone);

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
    });

    const { accessToken, refreshToken } = await this.generateTokens(createdUser);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(createdUser.id, hashedRefreshToken);

    return {
      message: 'User registered successfully.',
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

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

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

    if (!superAdmin || superAdmin.role !== UserRole.ADMIN) {
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
    await this.usersService.updateRefreshToken(superAdmin.id, hashedRefreshToken);
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
