import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectIdToAttachments1758500000000 implements MigrationInterface {
  name = 'AddProjectIdToAttachments1758500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN projectId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN projectId`);
  }
}
