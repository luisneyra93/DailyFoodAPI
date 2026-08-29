import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

/**
 * Catálogo de roles y su relación con `Usuarios`.
 *
 * Los pasos son idempotentes porque el esquema ya se aplicó a mano en el
 * entorno de desarrollo: así la misma migración sirve para levantar un entorno
 * nuevo desde cero sin romper el existente.
 */
export class CreateRolesAndUsuarioRol1756500000000 implements MigrationInterface {
  name = 'CreateRolesAndUsuarioRol1756500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Roles'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Roles',
          columns: [
            {
              name: 'Id',
              type: 'bigint',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'Nombre',
              type: 'varchar',
              length: '100',
              isNullable: false,
            },
            {
              name: 'CreatedAt',
              type: 'datetime',
              isNullable: true,
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
      );
    }

    // `Nombre` es la identidad del rol: sin índice único el catálogo se duplica.
    const roles = await queryRunner.getTable('Roles');
    if (!roles?.indices.some((i) => i.name === 'UQ_Roles_Nombre')) {
      await queryRunner.query(
        'ALTER TABLE `Roles` MODIFY `Nombre` VARCHAR(100) NOT NULL',
      );
      await queryRunner.query(
        'CREATE UNIQUE INDEX `UQ_Roles_Nombre` ON `Roles` (`Nombre`)',
      );
    }

    if (!(await queryRunner.hasColumn('Usuarios', 'IdRol'))) {
      await queryRunner.addColumn(
        'Usuarios',
        new TableColumn({ name: 'IdRol', type: 'bigint', isNullable: true }),
      );
      await queryRunner.query(
        'CREATE INDEX `FK_Usuario_Rol_idx` ON `Usuarios` (`IdRol`)',
      );
      await queryRunner.query(
        'ALTER TABLE `Usuarios` ADD CONSTRAINT `FK_Usuario_Rol` ' +
          'FOREIGN KEY (`IdRol`) REFERENCES `Roles` (`Id`) ' +
          'ON DELETE NO ACTION ON UPDATE NO ACTION',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('Usuarios', 'IdRol')) {
      await queryRunner.query(
        'ALTER TABLE `Usuarios` DROP FOREIGN KEY `FK_Usuario_Rol`',
      );
      await queryRunner.query('DROP INDEX `FK_Usuario_Rol_idx` ON `Usuarios`');
      await queryRunner.dropColumn('Usuarios', 'IdRol');
    }
    await queryRunner.dropTable('Roles', true);
  }
}
