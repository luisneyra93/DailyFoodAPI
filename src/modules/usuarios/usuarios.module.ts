import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from '../roles/roles.module';
import { UsuariosService } from './application/usuarios.service';
import { Usuario } from './domain/usuario.entity';
import { UsuarioRepository } from './domain/usuario.repository';
import { TypeOrmUsuarioRepository } from './infrastructure/typeorm-usuario.repository';
import { UsuariosController } from './presentation/usuarios.controller';

/**
 * Módulo de usuarios: resuelve el puerto `UsuarioRepository` con su adaptador de
 * TypeORM y expone `UsuariosService` al resto de módulos (p. ej. `auth`).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), RolesModule],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    { provide: UsuarioRepository, useClass: TypeOrmUsuarioRepository },
  ],
  exports: [UsuariosService],
})
export class UsuariosModule {}
