import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRadioLinkIdToAttachments1758200000000 implements MigrationInterface {
  name = 'AddRadioLinkIdToAttachments1758200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN radioLinkId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN radioLinkId`);
  }
}
