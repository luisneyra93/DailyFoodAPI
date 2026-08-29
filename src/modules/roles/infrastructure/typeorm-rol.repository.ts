import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rol } from '../domain/rol.entity';
import { NuevoRol, RolRepository } from '../domain/rol.repository';

/** Adaptador de {@link RolRepository} sobre TypeORM/MySQL. */
@Injectable()
export class TypeOrmRolRepository extends RolRepository {
  constructor(
    @InjectRepository(Rol)
    private readonly repository: Repository<Rol>,
  ) {
    super();
  }

  findAll(): Promise<Rol[]> {
    return this.repository.find({ order: { nombre: 'ASC' } });
  }

  findById(id: string): Promise<Rol | null> {
    return this.repository.findOne({ where: { id } });
  }

  existsByNombre(nombre: string): Promise<boolean> {
    return this.repository.existsBy({ nombre });
  }

  save(rol: NuevoRol): Promise<Rol> {
    return this.repository.save(this.repository.create(rol));
  }
}
