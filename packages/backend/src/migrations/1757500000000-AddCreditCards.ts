import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreditCards1757500000000 implements MigrationInterface {
  name = 'AddCreditCards1757500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS credit_card (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        bank TEXT NULL,
        brand TEXT NULL,
        \`limit\` REAL NOT NULL DEFAULT 0,
        closingDay INTEGER NOT NULL,
        dueDay INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_credit_card_name ON credit_card (name)
    `);
    await queryRunner.query(`
      ALTER TABLE finance_entry ADD COLUMN cardId INTEGER NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entry_card ON finance_entry (cardId)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE finance_entry DROP COLUMN cardId`);
    await queryRunner.query(`DROP TABLE IF EXISTS credit_card`);
  }
}
