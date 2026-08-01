import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStationEndsToRadioLinks1758100000000 implements MigrationInterface {
  name = 'AddStationEndsToRadioLinks1758100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE radio_link ADD COLUMN stationAId INTEGER NULL`);
    await queryRunner.query(`ALTER TABLE radio_link ADD COLUMN stationBId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE radio_link DROP COLUMN stationAId`);
    await queryRunner.query(`ALTER TABLE radio_link DROP COLUMN stationBId`);
  }
}
