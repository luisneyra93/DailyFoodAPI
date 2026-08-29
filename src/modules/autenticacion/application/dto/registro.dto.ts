import { CrearUsuarioDto } from '../../../usuarios/application/dto/crear-usuario.dto';

/**
 * El registro reutiliza el contrato de creación de usuario: una sola fuente de
 * verdad para las reglas de correo, contraseña y rol.
 *
 * OJO: al ser un endpoint público, quien se registra elige su propio `idRol`.
 * Sirve para roles de autoservicio (cliente, restaurante…); en cuanto exista un
 * rol privilegiado hay que restringir aquí qué roles son autoasignables.
 */
export class RegistroDto extends CrearUsuarioDto {}
