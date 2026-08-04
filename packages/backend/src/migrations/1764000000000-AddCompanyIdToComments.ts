import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyIdToComments1764000000000 implements MigrationInterface {
  name = 'AddCompanyIdToComments1764000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment ADD COLUMN companyId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment DROP COLUMN companyId`);
  }
}
