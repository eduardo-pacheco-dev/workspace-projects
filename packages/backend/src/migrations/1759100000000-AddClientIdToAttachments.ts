import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientIdToAttachments1759100000000 implements MigrationInterface {
  name = 'AddClientIdToAttachments1759100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN clientId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN clientId`);
  }
}
