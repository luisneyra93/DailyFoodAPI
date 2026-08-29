import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * `FK_PerfilPaciente_Usuario` pasa a `ON DELETE CASCADE`: el perfil no tiene
 * vida propia fuera de su usuario, así que borrar el usuario debe llevarse el
 * perfil por delante en lugar de bloquear el borrado.
 *
 * Ojo: esto NO habilita `TRUNCATE TABLE Usuarios`. MySQL rechaza truncar
 * cualquier tabla referenciada por una clave foránea (error 1701), haya o no
 * cascada; para vaciarla hay que usar `DELETE FROM Usuarios`.
 *
 * `Usuarios.IdRol` se queda en `NO ACTION` a propósito: borrar un rol del
 * catálogo no puede arrastrar a los usuarios que lo tienen.
 */
export class CascadePerfilPacienteUsuario1756900000000 implements MigrationInterface {
  name = 'CascadePerfilPacienteUsuario1756900000000';

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
      await queryRunner.query(
        'ALTER TABLE `PerfilPaciente` DROP FOREIGN KEY `FK_PerfilPaciente_Usuario`',
      );
    }
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` ADD CONSTRAINT `FK_PerfilPaciente_Usuario` ' +
        'FOREIGN KEY (`IdUsuario`) REFERENCES `Usuarios` (`Id`) ' +
        'ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasForeignKey(queryRunner)) {
      await queryRunner.query(
        'ALTER TABLE `PerfilPaciente` DROP FOREIGN KEY `FK_PerfilPaciente_Usuario`',
      );
    }
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` ADD CONSTRAINT `FK_PerfilPaciente_Usuario` ' +
        'FOREIGN KEY (`IdUsuario`) REFERENCES `Usuarios` (`Id`) ' +
        'ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }
}
