import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectIdToComments1758600000000 implements MigrationInterface {
  name = 'AddProjectIdToComments1758600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment ADD COLUMN projectId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment DROP COLUMN projectId`);
  }
}
