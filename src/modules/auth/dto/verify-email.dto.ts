import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/)
  otp!: string;
}
