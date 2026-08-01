import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectDocuments1758900000000 implements MigrationInterface {
  name = 'AddProjectDocuments1758900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_document (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        tipo TEXT NULL,
        quantidade INTEGER NOT NULL DEFAULT 1,
        observacoes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project_document`);
  }
}
