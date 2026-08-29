import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Endurece la tabla `Usuarios` preexistente:
 *  - `UserName` y `Password` pasan a NOT NULL (un usuario sin credenciales no
 *    es un estado válido del dominio).
 *  - Índice único sobre `UserName`, que es la garantía real de unicidad; la
 *    comprobación en el servicio sólo sirve para dar un error legible.
 *
 * Requiere que no existan filas con `UserName` nulo o duplicado.
 */
export class AddUsuariosConstraints1756400000000 implements MigrationInterface {
  name = 'AddUsuariosConstraints1756400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `Usuarios` MODIFY `UserName` VARCHAR(100) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `Usuarios` MODIFY `Password` TEXT NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_Usuarios_UserName` ON `Usuarios` (`UserName`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `UQ_Usuarios_UserName` ON `Usuarios`');
    await queryRunner.query(
      'ALTER TABLE `Usuarios` MODIFY `Password` TEXT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `Usuarios` MODIFY `UserName` VARCHAR(100) NULL',
    );
  }
}
