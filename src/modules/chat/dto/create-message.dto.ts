import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  recipientId!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;
}
