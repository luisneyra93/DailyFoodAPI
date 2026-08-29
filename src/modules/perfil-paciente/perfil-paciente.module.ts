import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuariosModule } from '../usuarios/usuarios.module';
import { PerfilPacienteService } from './application/perfil-paciente.service';
import { PerfilPaciente } from './domain/perfil-paciente.entity';
import { PerfilPacienteRepository } from './domain/perfil-paciente.repository';
import { TypeOrmPerfilPacienteRepository } from './infrastructure/typeorm-perfil-paciente.repository';
import { PerfilPacienteController } from './presentation/perfil-paciente.controller';

/**
 * Perfil clínico del paciente. Depende de `UsuariosModule` para comprobar que el
 * usuario existe y tiene rol Paciente antes de crear el perfil.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PerfilPaciente]), UsuariosModule],
  controllers: [PerfilPacienteController],
  providers: [
    PerfilPacienteService,
    {
      provide: PerfilPacienteRepository,
      useClass: TypeOrmPerfilPacienteRepository,
    },
  ],
  exports: [PerfilPacienteService],
})
export class PerfilPacienteModule {}
