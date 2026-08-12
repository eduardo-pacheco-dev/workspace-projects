import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStationTechnicalFields1780000000000 implements MigrationInterface {
  name = 'AddStationTechnicalFields1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE station ADD COLUMN elementType TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN technology TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN areaHolder TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN infraContractType TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN infraHolder TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN infraType TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN evType TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN evSupplier TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN regional TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN towerType TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN nominalAev REAL NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN groundArea REAL NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN structureHeight REAL NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN stationId TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE station DROP COLUMN elementType`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN technology`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN areaHolder`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN infraContractType`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN infraHolder`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN infraType`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN evType`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN evSupplier`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN regional`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN towerType`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN nominalAev`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN groundArea`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN structureHeight`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN stationId`);
  }
}
