import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOrderObservation1756000000005 implements MigrationInterface {
  name = 'AddServiceOrderObservation1756000000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS service_order_observation (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        serviceOrderId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        filename TEXT NULL,
        originalName TEXT NULL,
        mimetype TEXT NULL,
        size INTEGER NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_service_order_observation_so ON service_order_observation (serviceOrderId)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS service_order_observation`);
  }
}
