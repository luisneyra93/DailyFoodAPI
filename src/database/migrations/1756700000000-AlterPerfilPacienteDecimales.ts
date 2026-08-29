import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * `Estatura` y `Peso` estaban como `DECIMAL(10,0)`, que redondea a entero: una
 * estatura de 1.75 m se guardaba como 2. Pasan a `DECIMAL(5,2)` para admitir
 * metros y kilos con dos decimales (hasta 999.99).
 */
export class AlterPerfilPacienteDecimales1756700000000 implements MigrationInterface {
  name = 'AlterPerfilPacienteDecimales1756700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` MODIFY `Estatura` DECIMAL(5,2) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` MODIFY `Peso` DECIMAL(5,2) NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` MODIFY `Peso` DECIMAL(10,0) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `PerfilPaciente` MODIFY `Estatura` DECIMAL(10,0) NULL',
    );
  }
}
