import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinanceModule1757000000000 implements MigrationInterface {
  name = 'AddFinanceModule1757000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS finance_entry (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        paymentMethod TEXT NULL,
        status TEXT NOT NULL DEFAULT 'paid',
        notes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entry_date ON finance_entry (date)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entry_type ON finance_entry (type)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS spending_limit (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        category TEXT NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount REAL NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_spending_limit_period ON spending_limit (year, month)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS finance_entry`);
    await queryRunner.query(`DROP TABLE IF EXISTS spending_limit`);
  }
}
