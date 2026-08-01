import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountIdToEntries1757200000000 implements MigrationInterface {
  name = 'AddAccountIdToEntries1757200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE finance_entry ADD COLUMN accountId INTEGER NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entry_account ON finance_entry (accountId)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_finance_entry_account ON finance_entry`);
    await queryRunner.query(`ALTER TABLE finance_entry DROP COLUMN accountId`);
  }
}
