import type { PerfilPaciente } from './perfil-paciente.entity';

/** Datos necesarios para persistir un perfil de paciente nuevo. */
export interface NuevoPerfilPaciente {
  readonly nombre: string;
  readonly apellidoPaterno: string;
  readonly apellidoMaterno: string | null;
  readonly fechaNacimiento: string;
  readonly estatura: number;
  readonly peso: number;
  readonly idUsuario: string;
}

/**
 * Puerto de persistencia de perfiles de paciente. Sólo alta y consulta: el
 * perfil no se borra porque es el historial clínico básico del paciente.
 */
export abstract class PerfilPacienteRepository {
  abstract findAll(): Promise<PerfilPaciente[]>;
  abstract findById(id: string): Promise<PerfilPaciente | null>;
  abstract findByIdUsuario(idUsuario: string): Promise<PerfilPaciente | null>;
  abstract existsByIdUsuario(idUsuario: string): Promise<boolean>;
  abstract save(perfil: NuevoPerfilPaciente): Promise<PerfilPaciente>;
}
