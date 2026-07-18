import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserStatus } from '../../auth/enums/user-status.enum';

export class UpdateAdminDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string.' })
  @MinLength(2, { message: 'First name must be at least 2 characters.' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters.' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters.' })
  lastName?: string;

  @IsOptional()
  @Matches(/^(\+977)?9[6-9]\d{8}$/, {
    message: 'Please enter a valid mobile number.',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserStatus, {
    message: 'Status must be active, inactive, or suspended.',
  })
  status?: UserStatus;
}
