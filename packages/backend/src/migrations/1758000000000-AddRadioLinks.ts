import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRadioLinks1758000000000 implements MigrationInterface {
  name = 'AddRadioLinks1758000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS radio_link (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        frequencia TEXT NULL,
        capacidade TEXT NULL,
        siteIdA TEXT NULL,
        endIdA TEXT NULL,
        enderecoA TEXT NULL,
        latitudeA REAL NULL,
        longitudeA REAL NULL,
        operadoraA TEXT NULL,
        siteIdB TEXT NULL,
        endIdB TEXT NULL,
        enderecoB TEXT NULL,
        latitudeB REAL NULL,
        longitudeB REAL NULL,
        operadoraB TEXT NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS radio_link`);
  }
}
