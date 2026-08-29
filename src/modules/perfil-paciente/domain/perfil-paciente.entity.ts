import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Usuario } from '../../usuarios/domain/usuario.entity';

/**
 * El driver de MySQL devuelve los `DECIMAL` como cadena para no perder
 * precisión; el dominio los quiere como número.
 */
const decimalTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null): number | null =>
    value === null ? null : Number(value),
};

/** Entidad de dominio `PerfilPaciente`, mapeada a la tabla del mismo nombre. */
@Entity({ name: 'PerfilPaciente' })
export class PerfilPaciente {
  /** `BIGINT` se expone como `string` para no perder precisión en JS. */
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  id: string;

  @Column({ name: 'Nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'ApellidoPaterno', type: 'varchar', length: 45 })
  apellidoPaterno: string;

  @Column({
    name: 'ApellidoMaterno',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  apellidoMaterno: string | null;

  /** `DATE` sin hora: se maneja como `YYYY-MM-DD` para no arrastrar zonas horarias. */
  @Column({ name: 'FechaNacimiento', type: 'date' })
  fechaNacimiento: string;

  /** Estatura en metros, con dos decimales (`DECIMAL(5,2)`). */
  @Column({
    name: 'Estatura',
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  estatura: number;

  /** Peso en kilogramos, con dos decimales (`DECIMAL(5,2)`). */
  @Column({
    name: 'Peso',
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  peso: number;

  /** Clave foránea en crudo: permite asignar el usuario sin cargar la entidad. */
  @Column({ name: 'IdUsuario', type: 'bigint', nullable: true })
  idUsuario: string | null;

  /**
   * Usuario dueño del perfil. Es 1:1 — un usuario con rol Paciente tiene como
   * mucho un perfil — y por eso la migración añade un índice único sobre
   * `IdUsuario`.
   */
  @OneToOne(() => Usuario, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'IdUsuario' })
  usuario: Usuario | null;
}
