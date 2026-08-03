import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanies1762000000000 implements MigrationInterface {
  name = 'AddCompanies1762000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        cnpj TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        ativa TINYINT(1) NOT NULL DEFAULT 1,
        observacoes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS company`);
  }
}
