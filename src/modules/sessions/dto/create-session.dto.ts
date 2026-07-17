import { IsDateString, IsMongoId, IsOptional, IsString, Length } from 'class-validator';

export class CreateSessionDto {
  @IsMongoId()
  bookingId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  notes?: string;
}
