import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        resetToken TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS freelancer (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        userId INTEGER NULL,
        firstName TEXT NOT NULL DEFAULT '',
        lastName TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL,
        phone TEXT NULL,
        skills TEXT NULL,
        experienceLevel TEXT NOT NULL DEFAULT 'junior',
        availability TEXT NOT NULL DEFAULT 'available',
        hourlyRate REAL NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        budget REAL NOT NULL,
        budgetType TEXT NOT NULL,
        skills TEXT NOT NULL,
        experienceLevel TEXT NOT NULL,
        status TEXT NOT NULL,
        clientId TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS proposal (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        jobId INTEGER NOT NULL,
        coverLetter TEXT NULL,
        proposedBudget REAL NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contract (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        jobId INTEGER NOT NULL,
        terms TEXT NULL,
        startDate DATE NULL,
        endDate DATE NULL,
        status TEXT NOT NULL DEFAULT 'active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lpu (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT NULL,
        valor REAL NULL,
        data TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attachment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        jobId INTEGER NOT NULL,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS comment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        jobId INTEGER NOT NULL,
        content TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Anônimo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_freelancer_userId ON freelancer (userId)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_lpu_freelancerId ON lpu (freelancerId)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_attachment_jobId ON attachment (jobId)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_comment_jobId ON comment (jobId)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS comment`);
    await queryRunner.query(`DROP TABLE IF EXISTS attachment`);
    await queryRunner.query(`DROP TABLE IF EXISTS lpu`);
    await queryRunner.query(`DROP TABLE IF EXISTS contract`);
    await queryRunner.query(`DROP TABLE IF EXISTS proposal`);
    await queryRunner.query(`DROP TABLE IF EXISTS job`);
    await queryRunner.query(`DROP TABLE IF EXISTS freelancer`);
    await queryRunner.query(`DROP TABLE IF EXISTS user`);
  }
}
