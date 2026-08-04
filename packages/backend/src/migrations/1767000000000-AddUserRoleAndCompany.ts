import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleAndCompany1767000000000 implements MigrationInterface {
  name = 'AddUserRoleAndCompany1767000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user'`);
    await queryRunner.query(`ALTER TABLE user ADD COLUMN companyId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user DROP COLUMN companyId`);
    await queryRunner.query(`ALTER TABLE user DROP COLUMN role`);
  }
}
