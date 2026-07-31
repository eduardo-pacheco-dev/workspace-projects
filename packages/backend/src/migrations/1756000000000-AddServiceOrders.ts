import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOrders1756000000000 implements MigrationInterface {
  name = 'AddServiceOrders1756000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS service_order (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        numero TEXT NOT NULL,
        cliente TEXT NOT NULL,
        descricao TEXT NOT NULL,
        endereco TEXT NULL,
        data TEXT NULL,
        valor REAL NULL,
        status TEXT NOT NULL DEFAULT 'aberta',
        observacoes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS service_order`);
  }
}
