import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduleEvents1759800000000 implements MigrationInterface {
  name = 'AddScheduleEvents1759800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS schedule_event (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        description TEXT NULL,
        startAt TEXT NULL,
        endAt TEXT NULL,
        location TEXT NULL,
        client TEXT NULL,
        assignedTo TEXT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_event`);
  }
}
