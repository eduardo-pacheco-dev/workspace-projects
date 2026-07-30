import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeFreelancerEmailNullable1700000000002 implements MigrationInterface {
  name = 'MakeFreelancerEmailNullable1700000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE freelancer MODIFY email VARCHAR(255) NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE freelancer MODIFY email VARCHAR(255) NOT NULL`);
  }
}
