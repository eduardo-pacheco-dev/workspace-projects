import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMsProject1760000000000 implements MigrationInterface {
  name = 'AddMsProject1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_project (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        description TEXT NULL,
        startDate TEXT NULL,
        endDate TEXT NULL,
        durationDays INT NULL,
        status TEXT NOT NULL DEFAULT 'not_started',
        workingDays TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_task (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        name TEXT NOT NULL,
        durationDays INT NOT NULL DEFAULT 1,
        milestone BOOLEAN NOT NULL DEFAULT FALSE,
        percentComplete INT NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'medium',
        notes TEXT NULL,
        startDate TEXT NULL,
        finishDate TEXT NULL,
        critical BOOLEAN NOT NULL DEFAULT FALSE,
        position INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_dependency (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        taskId INT NOT NULL,
        predecessorTaskId INT NOT NULL,
        type TEXT NOT NULL DEFAULT 'FS',
        lagDays INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_resource (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'work',
        email TEXT NULL,
        maxUnits INT NOT NULL DEFAULT 100,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_assignment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        taskId INT NOT NULL,
        resourceId INT NOT NULL,
        units INT NOT NULL DEFAULT 100,
        work INT NULL,
        actualWork INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS mp_assignment`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_resource`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_dependency`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_task`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_project`);
  }
}
