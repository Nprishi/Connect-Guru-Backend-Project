import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitKycDto {
  @IsNotEmpty()
  @IsString()
  documentType!: string;

  @IsNotEmpty()
  @IsString()
  documentUrl!: string;
}

export class ReviewKycDto {
  @IsNotEmpty()
  @IsString()
  status!: string;

  @IsString()
  adminNote?: string;
}
