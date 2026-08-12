import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenVersionToUser1781000000000 implements MigrationInterface {
  name = 'AddTokenVersionToUser1781000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user ADD COLUMN tokenVersion INTEGER NOT NULL DEFAULT 0`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user DROP COLUMN tokenVersion`);
  }
}
