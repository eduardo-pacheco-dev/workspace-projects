import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLastNamePhone1753920000000 implements MigrationInterface {
  name = 'AddUserLastNamePhone1753920000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` ADD COLUMN \`lastName\` TEXT NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` ADD COLUMN \`phone\` TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`lastName\``);
  }
}
