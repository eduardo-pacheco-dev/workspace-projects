import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyIdToAttachments1763000000000 implements MigrationInterface {
  name = 'AddCompanyIdToAttachments1763000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN companyId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN companyId`);
  }
}
