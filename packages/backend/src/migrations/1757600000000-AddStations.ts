import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStations1757600000000 implements MigrationInterface {
  name = 'AddStations1757600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS station (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        codigo TEXT NULL,
        endereco TEXT NULL,
        latitude REAL NULL,
        longitude REAL NULL,
        tecnologia TEXT NULL,
        operadora TEXT NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS station`);
  }
}
