import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyMembers1765000000000 implements MigrationInterface {
  name = 'AddCompanyMembers1765000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_collaborator (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        companyId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        cargo TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_freelancer (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        companyId INTEGER NOT NULL,
        freelancerId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (companyId, freelancerId)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS company_freelancer`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_collaborator`);
  }
}
