import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Restablece `FK_PerfilPaciente_Usuario` después del cambio de tipo de
 * `Estatura`/`Peso`.
 *
 * MySQL descarta las claves foráneas de una tabla cuando un `ALTER TABLE` se
 * resuelve por copia y las comprobaciones de FK están desactivadas, que es lo
 * que ocurre al ejecutar migraciones. Por eso la creación de la FK va en una
 * migración posterior a cualquier cambio de columna, y es idempotente.
 */
export class EnsurePerfilPacienteUsuarioFk1756800000000 implements MigrationInterface {
  name = 'EnsurePerfilPacienteUsuarioFk1756800000000';

  private async hasForeignKey(queryRunner: QueryRunner): Promise<boolean> {
    const rows = (await queryRunner.query(
      'SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS ' +
        'WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
      ['PerfilPaciente', 'FK_PerfilPaciente_Usuario'],
    )) as unknown[];
    return rows.length > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasForeignKey(queryRunner)) {
      return;
    }
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` ADD CONSTRAINT `FK_PerfilPaciente_Usuario` ' +
        'FOREIGN KEY (`IdUsuario`) REFERENCES `Usuarios` (`Id`) ' +
        'ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasForeignKey(queryRunner)) {
      await queryRunner.query(
        'ALTER TABLE `PerfilPaciente` DROP FOREIGN KEY `FK_PerfilPaciente_Usuario`',
      );
    }
  }
}
