import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperadoraToProject1779000000000 implements MigrationInterface {
  name = 'AddOperadoraToProject1779000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE project ADD COLUMN operadora TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE project DROP COLUMN operadora`);
  }
}
