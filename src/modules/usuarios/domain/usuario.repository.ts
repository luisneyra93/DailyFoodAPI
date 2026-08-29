import type { Usuario } from './usuario.entity';

/** Datos necesarios para persistir un usuario nuevo (la clave ya viene hasheada). */
export interface NuevoUsuario {
  readonly userName: string;
  readonly password: string;
  readonly idRol: string | null;
}

/**
 * Puerto de persistencia de usuarios. La capa de aplicación depende de esta
 * clase abstracta (que además hace de token de inyección), nunca de TypeORM.
 */
export abstract class UsuarioRepository {
  abstract findById(id: string): Promise<Usuario | null>;
  abstract findByUserName(userName: string): Promise<Usuario | null>;
  /** Igual que {@link findByUserName} pero incluyendo el hash de la contraseña. */
  abstract findByUserNameWithPassword(
    userName: string,
  ): Promise<Usuario | null>;
  abstract existsByUserName(userName: string): Promise<boolean>;
  abstract save(usuario: NuevoUsuario): Promise<Usuario>;
}
