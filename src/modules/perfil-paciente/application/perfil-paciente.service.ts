import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { RolesConfig } from '../../../config/configuration';
import { UsuariosService } from '../../usuarios/application/usuarios.service';
import { PerfilPaciente } from '../domain/perfil-paciente.entity';
import { PerfilPacienteRepository } from '../domain/perfil-paciente.repository';
import { CrearPerfilPacienteDto } from './dto/crear-perfil-paciente.dto';

/**
 * Casos de uso del perfil de paciente. Aquí vive la regla de negocio central:
 * un perfil sólo puede colgar de un usuario con rol Paciente, y como mucho hay
 * un perfil por usuario.
 */
@Injectable()
export class PerfilPacienteService {
  private readonly logger = new Logger(PerfilPacienteService.name);
  private readonly pacienteRoleId: string;

  constructor(
    private readonly perfilRepository: PerfilPacienteRepository,
    private readonly usuariosService: UsuariosService,
    configService: ConfigService,
  ) {
    this.pacienteRoleId = String(
      configService.getOrThrow<RolesConfig>('roles').pacienteId,
    );
  }

  async create(dto: CrearPerfilPacienteDto): Promise<PerfilPaciente> {
    const idUsuario = String(dto.idUsuario);

    // Lanza 404 si el usuario no existe.
    const usuario = await this.usuariosService.findByIdOrFail(idUsuario);

    if (String(usuario.idRol ?? '') !== this.pacienteRoleId) {
      throw new UnprocessableEntityException(
        `El usuario ${idUsuario} no tiene rol Paciente (IdRol=${this.pacienteRoleId}).`,
      );
    }

    if (await this.perfilRepository.existsByIdUsuario(idUsuario)) {
      throw new ConflictException(
        `El usuario ${idUsuario} ya tiene un perfil de paciente.`,
      );
    }

    const perfil = await this.perfilRepository.save({
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno ?? null,
      fechaNacimiento: dto.fechaNacimiento,
      estatura: dto.estatura,
      peso: dto.peso,
      idUsuario,
    });

    this.logger.log(`Perfil de paciente creado para el usuario ${idUsuario}`);
    return perfil;
  }

  findAll(): Promise<PerfilPaciente[]> {
    return this.perfilRepository.findAll();
  }

  async findByIdOrFail(id: string): Promise<PerfilPaciente> {
    const perfil = await this.perfilRepository.findById(id);
    if (!perfil) {
      throw new NotFoundException(
        `No existe el perfil de paciente con id ${id}.`,
      );
    }
    return perfil;
  }

  async findByIdUsuarioOrFail(idUsuario: string): Promise<PerfilPaciente> {
    const perfil = await this.perfilRepository.findByIdUsuario(idUsuario);
    if (!perfil) {
      throw new NotFoundException(
        `El usuario ${idUsuario} no tiene perfil de paciente.`,
      );
    }
    return perfil;
  }
}
