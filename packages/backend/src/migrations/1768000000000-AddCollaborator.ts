import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollaborator1768000000000 implements MigrationInterface {
  name = 'AddCollaborator1768000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS collaborator (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        codigo TEXT NULL,
        nome TEXT NOT NULL,
        cpf TEXT NULL,
        cargo TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        dataAdmissao TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS collaborator`);
  }
}
