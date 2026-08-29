import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PerfilPaciente } from '../domain/perfil-paciente.entity';
import {
  NuevoPerfilPaciente,
  PerfilPacienteRepository,
} from '../domain/perfil-paciente.repository';

/** Relaciones que se cargan siempre: el perfil se lee junto a su usuario y rol. */
const RELATIONS = { usuario: { rol: true } } as const;

/** Adaptador de {@link PerfilPacienteRepository} sobre TypeORM/MySQL. */
@Injectable()
export class TypeOrmPerfilPacienteRepository extends PerfilPacienteRepository {
  constructor(
    @InjectRepository(PerfilPaciente)
    private readonly repository: Repository<PerfilPaciente>,
  ) {
    super();
  }

  findAll(): Promise<PerfilPaciente[]> {
    return this.repository.find({ relations: RELATIONS, order: { id: 'ASC' } });
  }

  findById(id: string): Promise<PerfilPaciente | null> {
    return this.repository.findOne({ where: { id }, relations: RELATIONS });
  }

  findByIdUsuario(idUsuario: string): Promise<PerfilPaciente | null> {
    return this.repository.findOne({
      where: { idUsuario },
      relations: RELATIONS,
    });
  }

  existsByIdUsuario(idUsuario: string): Promise<boolean> {
    return this.repository.existsBy({ idUsuario });
  }

  async save(perfil: NuevoPerfilPaciente): Promise<PerfilPaciente> {
    const saved = await this.repository.save(this.repository.create(perfil));
    // Se recarga para devolver el usuario resuelto, no sólo su id.
    return (await this.findById(saved.id)) ?? saved;
  }
}
