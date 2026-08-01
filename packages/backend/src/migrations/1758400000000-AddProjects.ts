import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjects1758400000000 implements MigrationInterface {
  name = 'AddProjects1758400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        codigo TEXT NULL,
        descricao TEXT NULL,
        cliente TEXT NULL,
        dataInicio TEXT NULL,
        dataFim TEXT NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project`);
  }
}
