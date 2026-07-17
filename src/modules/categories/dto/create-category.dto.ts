import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
