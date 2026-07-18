import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SystemSettingsDto {
  @IsOptional()
  @IsString({ message: 'Platform name must be a string.' })
  platformName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Support email must be a valid email address.' })
  supportEmail?: string;

  @IsOptional()
  @IsBoolean({ message: 'Maintenance mode must be a boolean.' })
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Registration enabled must be a boolean.' })
  registrationEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Commission percentage must be a number.' })
  @Min(0, { message: 'Commission percentage cannot be negative.' })
  @Max(100, { message: 'Commission percentage cannot exceed 100.' })
  commissionPercentage?: number;

  @IsOptional()
  @IsString({ message: 'Default currency must be a string.' })
  defaultCurrency?: string;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string.' })
  timezone?: string;

  @IsOptional()
  @IsString({ message: 'SMTP host must be a string.' })
  smtpHost?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'SMTP port must be a number.' })
  smtpPort?: number;

  @IsOptional()
  @IsString({ message: 'SMTP user must be a string.' })
  smtpUser?: string;

  @IsOptional()
  @IsString({ message: 'SMTP password must be a string.' })
  smtpPassword?: string;

  @IsOptional()
  @IsString({ message: 'Cloudinary cloud name must be a string.' })
  cloudinaryCloudName?: string;

  @IsOptional()
  @IsString({ message: 'Cloudinary API key must be a string.' })
  cloudinaryApiKey?: string;

  @IsOptional()
  @IsString({ message: 'Cloudinary API secret must be a string.' })
  cloudinaryApiSecret?: string;

  @IsOptional()
  @IsString({ message: 'Redis host must be a string.' })
  redisHost?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Redis port must be a number.' })
  redisPort?: number;

  @IsOptional()
  @IsString({ message: 'Redis password must be a string.' })
  redisPassword?: string;

  @IsOptional()
  @IsString({ message: 'JWT access token expiry must be a string.' })
  jwtAccessTokenExpiry?: string;

  @IsOptional()
  @IsString({ message: 'JWT refresh token expiry must be a string.' })
  jwtRefreshTokenExpiry?: string;
}
