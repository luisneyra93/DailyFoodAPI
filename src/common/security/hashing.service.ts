/**
 * Puerto de hashing de contraseñas. El dominio depende de esta abstracción y no
 * del algoritmo concreto, de modo que cambiar bcrypt por argon2 (o rotar el
 * coste) no obliga a tocar los casos de uso.
 */
export abstract class HashingService {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
}
