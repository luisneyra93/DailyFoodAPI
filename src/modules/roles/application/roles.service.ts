import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { Rol } from '../domain/rol.entity';
import { RolRepository } from '../domain/rol.repository';
import { CrearRolDto } from './dto/crear-rol.dto';

/** Código de error de MySQL para violación de índice único. */
const MYSQL_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

/**
 * Casos de uso del catálogo de roles. Es un catálogo de sólo alta y consulta:
 * no se expone baja ni modificación porque los roles quedan referenciados por
 * `Usuarios.IdRol` y borrarlos rompería registros existentes.
 */
@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly rolRepository: RolRepository) {}

  async create(dto: CrearRolDto): Promise<Rol> {
    if (await this.rolRepository.existsByNombre(dto.nombre)) {
      throw new ConflictException(`El rol "${dto.nombre}" ya existe.`);
    }

    try {
      const rol = await this.rolRepository.save({ nombre: dto.nombre });
      this.logger.log(`Rol creado: ${rol.nombre}`);
      return rol;
    } catch (error) {
      // Cierra la ventana de carrera entre el `existsByNombre` y el INSERT.
      if ((error as { code?: string }).code === MYSQL_DUPLICATE_ENTRY) {
        throw new ConflictException(`El rol "${dto.nombre}" ya existe.`);
      }
      throw error;
    }
  }

  findAll(): Promise<Rol[]> {
    return this.rolRepository.findAll();
  }

  async findByIdOrFail(id: string): Promise<Rol> {
    const rol = await this.rolRepository.findById(id);
    if (!rol) {
      throw new NotFoundException(`No existe el rol con id ${id}.`);
    }
    return rol;
  }
}
