import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStationIdToAttachments1757800000000 implements MigrationInterface {
  name = 'AddStationIdToAttachments1757800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN stationId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN stationId`);
  }
}
