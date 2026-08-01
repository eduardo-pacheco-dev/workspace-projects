import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRadioLinkIdToComments1758300000000 implements MigrationInterface {
  name = 'AddRadioLinkIdToComments1758300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment ADD COLUMN radioLinkId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment DROP COLUMN radioLinkId`);
  }
}
