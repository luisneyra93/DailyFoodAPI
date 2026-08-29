import type { Rol } from './rol.entity';

/** Datos necesarios para persistir un rol nuevo. */
export interface NuevoRol {
  readonly nombre: string;
}

/**
 * Puerto de persistencia de roles. Sólo declara las operaciones que el dominio
 * necesita: el catálogo es de alta y consulta, sin baja ni modificación.
 */
export abstract class RolRepository {
  abstract findAll(): Promise<Rol[]>;
  abstract findById(id: string): Promise<Rol | null>;
  abstract existsByNombre(nombre: string): Promise<boolean>;
  abstract save(rol: NuevoRol): Promise<Rol>;
}
