import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Corrige la relación entre `PerfilPaciente` y `Usuarios`.
 *
 * La constraint original se creó sobre `PerfilPaciente.Id` (la PK
 * autoincremental) en lugar de sobre `PerfilPaciente.IdUsuario`, lo que obliga
 * a que el id del perfil coincida con el id del usuario y hace imposible
 * insertar perfiles. Aquí se mueve la clave foránea a `IdUsuario` y se añade el
 * índice único que materializa la relación 1:1 (un perfil por usuario).
 */
export class FixPerfilPacienteUsuarioFk1756600000000 implements MigrationInterface {
  name = 'FixPerfilPacienteUsuarioFk1756600000000';

  private async hasConstraint(
    queryRunner: QueryRunner,
    name: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS ' +
        'WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
      ['PerfilPaciente', name],
    )) as unknown[];
    return rows.length > 0;
  }

  private async hasIndex(
    queryRunner: QueryRunner,
    name: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      'SELECT 1 FROM information_schema.STATISTICS ' +
        'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?',
      ['PerfilPaciente', name],
    )) as unknown[];
    return rows.length > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasConstraint(queryRunner, 'FK_PerfilPaciente_Usuario')) {
      await queryRunner.query(
        'ALTER TABLE `PerfilPaciente` DROP FOREIGN KEY `FK_PerfilPaciente_Usuario`',
      );
    }

    // Un usuario tiene como mucho un perfil: el índice único es la garantía
    // real; la comprobación del servicio sólo da un 409 legible.
    if (!(await this.hasIndex(queryRunner, 'UQ_PerfilPaciente_IdUsuario'))) {
      await queryRunner.query(
        'CREATE UNIQUE INDEX `UQ_PerfilPaciente_IdUsuario` ON `PerfilPaciente` (`IdUsuario`)',
      );
    }

    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` ADD CONSTRAINT `FK_PerfilPaciente_Usuario` ' +
        'FOREIGN KEY (`IdUsuario`) REFERENCES `Usuarios` (`Id`) ' +
        'ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasConstraint(queryRunner, 'FK_PerfilPaciente_Usuario')) {
      await queryRunner.query(
        'ALTER TABLE `PerfilPaciente` DROP FOREIGN KEY `FK_PerfilPaciente_Usuario`',
      );
    }
    if (await this.hasIndex(queryRunner, 'UQ_PerfilPaciente_IdUsuario')) {
      await queryRunner.query(
        'DROP INDEX `UQ_PerfilPaciente_IdUsuario` ON `PerfilPaciente`',
      );
    }
    // Se restaura la constraint original (sobre `Id`) tal y como estaba.
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` ADD CONSTRAINT `FK_PerfilPaciente_Usuario` ' +
        'FOREIGN KEY (`Id`) REFERENCES `Usuarios` (`Id`) ' +
        'ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }
}
