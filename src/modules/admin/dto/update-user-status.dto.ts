import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  @IsIn(['active', 'inactive', 'suspended', 'banned'])
  status!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  reason?: string;
}
