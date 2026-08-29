import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Rol } from '../../roles/domain/rol.entity';

/**
 * Entidad de dominio `Usuario`, mapeada a la tabla existente `Usuarios`.
 *
 * Los nombres de columna se declaran explícitamente porque la tabla usa
 * PascalCase y el modelo TypeScript usa camelCase: la persistencia no debe
 * imponer su convención al dominio.
 */
@Entity({ name: 'Usuarios' })
export class Usuario {
  /** `BIGINT` se expone como `string` para no perder precisión en JS. */
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  id: string;

  @Column({ name: 'UserName', type: 'varchar', length: 100 })
  userName: string;

  /**
   * Hash bcrypt de la contraseña. `select: false` evita que salga en cualquier
   * consulta por defecto: sólo se carga de forma explícita al autenticar.
   */
  @Column({ name: 'Password', type: 'text', select: false })
  password: string;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt: Date;

  /** Clave foránea en crudo: permite asignar el rol sin cargar la entidad. */
  @Column({ name: 'IdRol', type: 'bigint', nullable: true })
  idRol: string | null;

  /**
   * Rol asociado (FK `FK_Usuario_Rol`). Es opcional porque la columna admite
   * nulos: hay usuarios dados de alta antes de existir el catálogo de roles.
   */
  @ManyToOne(() => Rol, { nullable: true })
  @JoinColumn({ name: 'IdRol' })
  rol: Rol | null;
}
