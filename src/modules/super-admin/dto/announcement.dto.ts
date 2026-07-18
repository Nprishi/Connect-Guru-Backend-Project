import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum AnnouncementAudience {
  ALL = 'ALL',
  ADMINS = 'ADMINS',
  TEACHERS = 'TEACHERS',
  STUDENTS = 'STUDENTS',
}

export class CreateAnnouncementDto {
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString({ message: 'Title must be a string.' })
  @MinLength(2, { message: 'Title must be at least 2 characters.' })
  @MaxLength(120, { message: 'Title cannot exceed 120 characters.' })
  title!: string;

  @IsNotEmpty({ message: 'Message is required.' })
  @IsString({ message: 'Message must be a string.' })
  @MinLength(2, { message: 'Message must be at least 2 characters.' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters.' })
  message!: string;

  @IsNotEmpty({ message: 'Priority is required.' })
  @IsString({ message: 'Priority must be a string.' })
  priority!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid ISO date string.' })
  expiresAt?: string;

  @IsNotEmpty({ message: 'Audience is required.' })
  @IsEnum(AnnouncementAudience, {
    message: 'Audience must be ALL, ADMINS, TEACHERS, or STUDENTS.',
  })
  audience!: AnnouncementAudience;
}
