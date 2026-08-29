import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Tabla de refresh tokens. Guarda el hash del token, su caducidad y la cadena
 * de rotación, que es lo que permite revocar sesiones y detectar el reúso de un
 * token ya consumido.
 *
 * La FK va con `ON DELETE CASCADE`: al borrar un usuario desaparecen sus
 * sesiones. El índice único sobre `TokenHash` es además el que usa la búsqueda
 * en cada refresco.
 */
export class CreateRefreshTokens1757000000000 implements MigrationInterface {
  name = 'CreateRefreshTokens1757000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('RefreshTokens')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'RefreshTokens',
        columns: [
          {
            name: 'Id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'IdUsuario', type: 'bigint', isNullable: false },
          { name: 'TokenHash', type: 'char', length: '64', isNullable: false },
          { name: 'ExpiresAt', type: 'datetime', isNullable: false },
          {
            name: 'CreatedAt',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'RevokedAt', type: 'datetime', isNullable: true },
          { name: 'ReplacedById', type: 'bigint', isNullable: true },
        ],
      }),
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_RefreshTokens_TokenHash` ON `RefreshTokens` (`TokenHash`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IX_RefreshTokens_IdUsuario` ON `RefreshTokens` (`IdUsuario`)',
    );
    await queryRunner.query(
      'ALTER TABLE `RefreshTokens` ADD CONSTRAINT `FK_RefreshToken_Usuario` ' +
        'FOREIGN KEY (`IdUsuario`) REFERENCES `Usuarios` (`Id`) ' +
        'ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('RefreshTokens', true);
  }
}
