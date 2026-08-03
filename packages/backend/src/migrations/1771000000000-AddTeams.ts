import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeams1771000000000 implements MigrationInterface {
  name = 'AddTeams1771000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team_member (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        teamId INTEGER NOT NULL,
        collaboratorId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (teamId, collaboratorId)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS team_member`);
    await queryRunner.query(`DROP TABLE IF EXISTS team`);
  }
}
