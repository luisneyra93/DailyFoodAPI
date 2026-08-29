import { ApiProperty } from '@nestjs/swagger';

import { UsuarioResponseDto } from '../../../usuarios/presentation/dto/usuario-response.dto';
import type { PerfilPaciente } from '../../domain/perfil-paciente.entity';

/** Representación pública del perfil de un paciente. */
export class PerfilPacienteResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Luis' })
  nombre: string;

  @ApiProperty({ example: 'Neyra' })
  apellidoPaterno: string;

  @ApiProperty({ example: 'Morales', nullable: true })
  apellidoMaterno: string | null;

  @ApiProperty({ example: '1993-05-14', format: 'date' })
  fechaNacimiento: string;

  @ApiProperty({ example: 1.75, description: 'Estatura en metros.' })
  estatura: number;

  @ApiProperty({ example: 72.5, description: 'Peso en kilogramos.' })
  peso: number;

  @ApiProperty({ type: UsuarioResponseDto, nullable: true })
  usuario: UsuarioResponseDto | null;

  static fromEntity(perfil: PerfilPaciente): PerfilPacienteResponseDto {
    const dto = new PerfilPacienteResponseDto();
    dto.id = String(perfil.id);
    dto.nombre = perfil.nombre;
    dto.apellidoPaterno = perfil.apellidoPaterno;
    dto.apellidoMaterno = perfil.apellidoMaterno;
    dto.fechaNacimiento = perfil.fechaNacimiento;
    dto.estatura = perfil.estatura;
    dto.peso = perfil.peso;
    dto.usuario = perfil.usuario
      ? UsuarioResponseDto.fromEntity(perfil.usuario)
      : null;
    return dto;
  }
}
