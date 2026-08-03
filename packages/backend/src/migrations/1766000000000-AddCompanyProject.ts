import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyProject1766000000000 implements MigrationInterface {
  name = 'AddCompanyProject1766000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_project (
        projectId INTEGER NOT NULL,
        companyId INTEGER NOT NULL,
        PRIMARY KEY (projectId, companyId)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS company_project`);
  }
}
