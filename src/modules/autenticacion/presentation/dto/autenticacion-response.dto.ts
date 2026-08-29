import { ApiProperty } from '@nestjs/swagger';

import { UsuarioResponseDto } from '../../../usuarios/presentation/dto/usuario-response.dto';

export class AutenticacionResponseDto {
  @ApiProperty({ description: 'JWT a enviar en la cabecera Authorization.' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({
    example: 3600,
    description: 'Vigencia del access token en segundos.',
  })
  expiresIn: number;

  @ApiProperty({
    description:
      'Token opaco para obtener un access token nuevo. Se invalida al usarlo.',
  })
  refreshToken: string;

  @ApiProperty({
    example: '2026-09-04T18:30:00.000Z',
    description: 'Caducidad del refresh token.',
  })
  refreshTokenExpiresAt: Date;

  @ApiProperty({ type: UsuarioResponseDto })
  usuario: UsuarioResponseDto;
}
