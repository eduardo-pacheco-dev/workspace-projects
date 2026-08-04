import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyIdToCollaborator1769000000000 implements MigrationInterface {
  name = 'AddCompanyIdToCollaborator1769000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN companyId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN companyId`);
  }
}
