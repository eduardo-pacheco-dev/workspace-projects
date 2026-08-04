import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentToTask1775000000000 implements MigrationInterface {
  name = 'AddParentToTask1775000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE task ADD COLUMN parentId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE task DROP COLUMN parentId`);
  }
}
