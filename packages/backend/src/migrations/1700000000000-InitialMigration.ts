import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        resetToken VARCHAR(255) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS freelancer (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        userId INTEGER NULL,
        firstName VARCHAR(255) NOT NULL DEFAULT '',
        lastName VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(255) NULL,
        phone VARCHAR(255) NULL,
        skills TEXT NULL,
        portfolio TEXT NULL,
        bio TEXT NULL,
        experienceLevel VARCHAR(50) NOT NULL DEFAULT 'junior',
        availability VARCHAR(50) NOT NULL DEFAULT 'available',
        hourlyRate REAL NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        budget REAL NOT NULL,
        budgetType VARCHAR(50) NOT NULL,
        skills TEXT NOT NULL,
        experienceLevel VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        clientId VARCHAR(255) NULL,
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
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
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
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lpu (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT NULL,
        valor REAL NULL,
        data TEXT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attachment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        jobId INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS comment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        jobId INTEGER NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL DEFAULT 'Anônimo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
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
