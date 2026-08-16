import { MigrationInterface, QueryRunner } from 'typeorm';

export class DashboardNotes1710000000000 implements MigrationInterface {
  name = 'DashboardNotes1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS dashboard_note (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        userId INTEGER NOT NULL,
        content TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_dashboard_note_userId ON dashboard_note (userId)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS dashboard_note`);
  }
}
