import { OmitType } from '@nestjs/swagger';

import { CrearUsuarioDto } from '../../../usuarios/application/dto/crear-usuario.dto';

/**
 * Alta de paciente: mismas reglas de correo y contraseña, pero sin `idRol`.
 * El rol lo fija el servidor (`ROL_PACIENTE_ID`), no el cliente: así este
 * endpoint público no puede usarse para autoasignarse un rol privilegiado.
 */
export class RegistroPacienteDto extends OmitType(CrearUsuarioDto, [
  'idRol',
] as const) {}
