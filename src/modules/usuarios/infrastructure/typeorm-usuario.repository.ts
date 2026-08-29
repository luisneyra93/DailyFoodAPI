import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../domain/usuario.entity';
import { NuevoUsuario, UsuarioRepository } from '../domain/usuario.repository';

/** Adaptador de {@link UsuarioRepository} sobre TypeORM/MySQL. */
@Injectable()
export class TypeOrmUsuarioRepository extends UsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {
    super();
  }

  findById(id: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { id },
      relations: { rol: true },
    });
  }

  findByUserName(userName: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { userName },
      relations: { rol: true },
    });
  }

  findByUserNameWithPassword(userName: string): Promise<Usuario | null> {
    // `password` tiene `select: false`, hay que pedirlo de forma explícita.
    return this.repository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('usuario.userName = :userName', { userName })
      .getOne();
  }

  existsByUserName(userName: string): Promise<boolean> {
    return this.repository.existsBy({ userName });
  }

  async save(usuario: NuevoUsuario): Promise<Usuario> {
    const entity = this.repository.create(usuario);
    const saved = await this.repository.save(entity);
    // Se recarga para devolver el rol resuelto, no sólo su id.
    return (await this.findById(saved.id)) ?? saved;
  }
}
