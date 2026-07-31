import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1754000000000 implements MigrationInterface {
  name = 'AddUserStatus1754000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`status\` TEXT NOT NULL DEFAULT 'inactive'`,
    );
    await queryRunner.query(`UPDATE \`user\` SET \`status\` = 'active'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`status\``);
  }
}
