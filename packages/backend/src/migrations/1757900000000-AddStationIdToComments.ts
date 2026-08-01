import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStationIdToComments1757900000000 implements MigrationInterface {
  name = 'AddStationIdToComments1757900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment ADD COLUMN stationId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE comment DROP COLUMN stationId`);
  }
}
