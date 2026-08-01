import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntryRecurrenceTagsAttachment1757400000000 implements MigrationInterface {
  name = 'AddEntryRecurrenceTagsAttachment1757400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE finance_entry
        ADD COLUMN recurrence TEXT NULL,
        ADD COLUMN recurrenceEnd TEXT NULL,
        ADD COLUMN seriesId TEXT NULL,
        ADD COLUMN tags TEXT NULL,
        ADD COLUMN attachment TEXT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entry_series ON finance_entry (seriesId)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_finance_entry_series ON finance_entry`);
    await queryRunner.query(`
      ALTER TABLE finance_entry
        DROP COLUMN recurrence,
        DROP COLUMN recurrenceEnd,
        DROP COLUMN seriesId,
        DROP COLUMN tags,
        DROP COLUMN attachment
    `);
  }
}
