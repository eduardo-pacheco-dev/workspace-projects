import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResponsavelToProject1774000000000 implements MigrationInterface {
  name = 'AddResponsavelToProject1774000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE project ADD COLUMN responsavel TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE project DROP COLUMN responsavel`);
  }
}
