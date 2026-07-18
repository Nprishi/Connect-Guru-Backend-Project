import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Gender } from '../../auth/enums/gender.enum';
import { UserStatus } from '../../auth/enums/user-status.enum';

export class CreateAdminDto {
  @IsNotEmpty({ message: 'First name is required.' })
  @IsString({ message: 'First name must be a string.' })
  @MinLength(2, { message: 'First name must be at least 2 characters.' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters.' })
  firstName!: string;

  @IsNotEmpty({ message: 'Last name is required.' })
  @IsString({ message: 'Last name must be a string.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters.' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters.' })
  lastName!: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(32, { message: 'Password cannot exceed 32 characters.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,32}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password!: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^(\+977)?9[6-9]\d{8}$/, {
    message: 'Please enter a valid mobile number.',
  })
  phone!: string;

  @IsOptional()
  @IsEnum(Gender, {
    message: 'Gender must be male, female, or other.',
  })
  gender?: Gender;

  @IsOptional()
  @IsEnum(UserStatus, {
    message: 'Status must be active, inactive, or suspended.',
  })
  status?: UserStatus;
}
