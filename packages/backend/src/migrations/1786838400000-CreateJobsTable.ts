import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobsTable1786838400000 implements MigrationInterface {
  name = 'CreateJobsTable1786838400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pdca_job (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        descricao TEXT NULL,
        cronExpression TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        ultimoExecutadoEm DATETIME NULL,
        proximaExecucaoEm DATETIME NULL,
        empresaId INTEGER NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_pdca_job_empresaId FOREIGN KEY (empresaId) REFERENCES company(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_pdca_job_empresaId ON pdca_job (empresaId)
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS job`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        budget REAL NOT NULL,
        budgetType VARCHAR(50) NOT NULL,
        skills TEXT NOT NULL,
        experienceLevel VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        clientId VARCHAR(255) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS pdca_job`);
  }
}