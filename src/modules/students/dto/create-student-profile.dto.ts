import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateStudentProfileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSubjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningGoals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  bio?: string;
}
