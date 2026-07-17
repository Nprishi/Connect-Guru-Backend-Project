import { IsBoolean, IsMongoId, IsOptional, IsString, Length } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  description?: string;

  @IsMongoId()
  categoryId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
