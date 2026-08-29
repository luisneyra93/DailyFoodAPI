import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { HashingService } from '../../../common/security/hashing.service';
import { RolesService } from '../../roles/application/roles.service';
import { Usuario } from '../domain/usuario.entity';
import { UsuarioRepository } from '../domain/usuario.repository';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

/** Código de error de MySQL para violación de índice único. */
const MYSQL_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

/**
 * Casos de uso sobre usuarios. Es el único lugar donde se decide cómo se crea
 * un usuario (unicidad + hashing + rol); ni el controlador ni el módulo de auth
 * manipulan contraseñas en claro más allá de recibirlas.
 */
@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CrearUsuarioDto): Promise<Usuario> {
    if (await this.usuarioRepository.existsByUserName(dto.userName)) {
      throw new ConflictException('El nombre de usuario ya está registrado.');
    }

    // Se valida el rol antes de insertar: mejor un 404 explicativo que el error
    // opaco de la clave foránea `FK_Usuario_Rol`.
    const idRol = dto.idRol
      ? (await this.rolesService.findByIdOrFail(String(dto.idRol))).id
      : null;

    const password = await this.hashingService.hash(dto.password);

    try {
      const usuario = await this.usuarioRepository.save({
        userName: dto.userName,
        password,
        idRol,
      });
      this.logger.log(`Usuario registrado: ${usuario.userName}`);
      return usuario;
    } catch (error) {
      // Cierra la ventana de carrera entre el `existsByUserName` y el INSERT.
      if ((error as { code?: string }).code === MYSQL_DUPLICATE_ENTRY) {
        throw new ConflictException('El nombre de usuario ya está registrado.');
      }
      throw error;
    }
  }

  async findByIdOrFail(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`No existe el usuario con id ${id}.`);
    }
    return usuario;
  }

  /** Devuelve el usuario con su hash: uso exclusivo del flujo de autenticación. */
  findByUserNameWithPassword(userName: string): Promise<Usuario | null> {
    return this.usuarioRepository.findByUserNameWithPassword(userName);
  }
}
