import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './application/roles.service';
import { Rol } from './domain/rol.entity';
import { RolRepository } from './domain/rol.repository';
import { TypeOrmRolRepository } from './infrastructure/typeorm-rol.repository';
import { RolesController } from './presentation/roles.controller';

/**
 * Catálogo de roles: resuelve el puerto `RolRepository` con su adaptador de
 * TypeORM y expone `RolesService` (lo consume `users` al asignar el rol).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [RolesController],
  providers: [
    RolesService,
    { provide: RolRepository, useClass: TypeOrmRolRepository },
  ],
  exports: [RolesService],
})
export class RolesModule {}
