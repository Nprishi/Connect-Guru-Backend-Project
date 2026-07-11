import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required.' })
  @IsJWT({
    message: 'Invalid refresh token format.',
  })
  refreshToken!: string;
}
