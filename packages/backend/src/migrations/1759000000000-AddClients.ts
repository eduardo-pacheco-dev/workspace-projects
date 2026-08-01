import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClients1759000000000 implements MigrationInterface {
  name = 'AddClients1759000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS client (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        documento TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS client`);
  }
}
