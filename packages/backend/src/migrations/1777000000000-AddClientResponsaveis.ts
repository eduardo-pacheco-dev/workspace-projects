import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientResponsaveis1777000000000 implements MigrationInterface {
  name = 'AddClientResponsaveis1777000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS client_responsavel (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        clientId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        funcao TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_client_responsavel_client FOREIGN KEY (clientId) REFERENCES client(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_client_responsavel_clientId ON client_responsavel (clientId)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS client_responsavel`);
  }
}
