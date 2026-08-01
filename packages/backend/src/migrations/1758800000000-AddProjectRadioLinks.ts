import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectRadioLinks1758800000000 implements MigrationInterface {
  name = 'AddProjectRadioLinks1758800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_radio_link (
        projectId INTEGER NOT NULL,
        radioLinkId INTEGER NOT NULL,
        PRIMARY KEY (projectId, radioLinkId)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project_radio_link`);
  }
}
