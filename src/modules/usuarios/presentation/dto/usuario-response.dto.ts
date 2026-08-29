import { ApiProperty } from '@nestjs/swagger';

import { RolResponseDto } from '../../../roles/presentation/dto/rol-response.dto';
import type { Usuario } from '../../domain/usuario.entity';

/**
 * Representación pública de un usuario. Es el único objeto que sale por la API:
 * garantiza que el hash de la contraseña nunca se serializa.
 */
export class UsuarioResponseDto {
  @ApiProperty({ example: '1', description: 'Identificador del usuario.' })
  id: string;

  @ApiProperty({ example: 'luis.neyra@dailyfood.com', format: 'email' })
  userName: string;

  @ApiProperty({ example: '2026-08-28T18:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    type: RolResponseDto,
    nullable: true,
    description: 'Rol asignado, o null si el usuario todavía no tiene rol.',
  })
  rol: RolResponseDto | null;

  static fromEntity(usuario: Usuario): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = String(usuario.id);
    dto.userName = usuario.userName;
    dto.createdAt = usuario.createdAt;
    dto.rol = usuario.rol ? RolResponseDto.fromEntity(usuario.rol) : null;
    return dto;
  }
}
