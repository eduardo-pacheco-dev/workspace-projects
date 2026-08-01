import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategories1757300000000 implements MigrationInterface {
  name = 'AddCategories1757300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_category_name ON category (name)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS category`);
  }
}
