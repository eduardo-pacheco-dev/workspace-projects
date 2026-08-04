import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskIdToAttachments1776000000000 implements MigrationInterface {
  name = 'AddTaskIdToAttachments1776000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN taskId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN taskId`);
  }
}
