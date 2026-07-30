import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerIdToAttachment1700000000003 implements MigrationInterface {
  name = 'AddFreelancerIdToAttachment1700000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN freelancerId INTEGER NULL`);
    await queryRunner.query(`ALTER TABLE attachment MODIFY COLUMN jobId INTEGER NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN freelancerId`);
    await queryRunner.query(`ALTER TABLE attachment MODIFY COLUMN jobId INTEGER NOT NULL`);
  }
}
