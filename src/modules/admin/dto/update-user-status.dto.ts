import { IsIn, IsMongoId, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserStatusDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  @IsIn(['active', 'inactive', 'suspended', 'blocked'])
  status!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  reason?: string;
}
