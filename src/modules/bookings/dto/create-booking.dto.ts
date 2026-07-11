import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { BookingStatus } from '../schema/booking.schema';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  teacherId!: string;

  @IsNotEmpty()
  @IsString()
  subject!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, { message: 'Invalid booking status.' })
  status!: BookingStatus;
}
