import { ApiProperty } from '@nestjs/swagger';

import type { Rol } from '../../domain/rol.entity';

/** Representación pública de un rol. */
export class RolResponseDto {
  @ApiProperty({ example: '1', description: 'Identificador del rol.' })
  id: string;

  @ApiProperty({ example: 'Administrador' })
  nombre: string;

  @ApiProperty({ example: '2026-08-28T18:30:00.000Z' })
  createdAt: Date;

  static fromEntity(rol: Rol): RolResponseDto {
    const dto = new RolResponseDto();
    dto.id = String(rol.id);
    dto.nombre = rol.nombre;
    dto.createdAt = rol.createdAt;
    return dto;
  }
}
