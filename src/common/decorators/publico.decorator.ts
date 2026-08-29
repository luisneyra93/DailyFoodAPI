import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO_KEY = 'esPublico';

/**
 * Marca una ruta como accesible sin JWT. La API es privada por defecto (guard
 * global), así que la excepción tiene que ser explícita y visible en el código.
 */
export const Publico = () => SetMetadata(ES_PUBLICO_KEY, true);
