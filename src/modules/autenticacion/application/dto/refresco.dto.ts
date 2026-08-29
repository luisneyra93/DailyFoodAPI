import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefrescoDto {
  @ApiProperty({
    description: 'Refresh token entregado en el último acceso o refresco.',
    example: 'k4Zx9...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  refreshToken: string;
}
