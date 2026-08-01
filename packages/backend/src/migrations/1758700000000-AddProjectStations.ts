import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectStations1758700000000 implements MigrationInterface {
  name = 'AddProjectStations1758700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_station (
        projectId INTEGER NOT NULL,
        stationId INTEGER NOT NULL,
        PRIMARY KEY (projectId, stationId)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project_station`);
  }
}
