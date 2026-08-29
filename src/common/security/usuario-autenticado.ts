/** Identidad del usuario autenticado, derivada del JWT en cada request. */
export interface UsuarioAutenticado {
  readonly id: string;
  readonly userName: string;
}
