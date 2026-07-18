/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SuperAdminLoginDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters.',
  })
  password!: string;

  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'Secret key must be a string.' })
  @IsNotEmpty({ message: 'Secret key is required.' })
  @MaxLength(255, {
    message: 'Secret key is too long.',
  })
  secretKey!: string;
}
