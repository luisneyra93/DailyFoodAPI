import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Entidad de dominio `Rol`, mapeada a la tabla existente `Roles`. */
@Entity({ name: 'Roles' })
export class Rol {
  /** `BIGINT` se expone como `string` para no perder precisión en JS. */
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  id: string;

  @Column({ name: 'Nombre', type: 'varchar', length: 100 })
  nombre: string;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt: Date;
}
