import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientIdToComments1759200000000 implements MigrationInterface {
  name = 'AddClientIdToComments1759200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment ADD COLUMN clientId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment DROP COLUMN clientId`);
  }
}
